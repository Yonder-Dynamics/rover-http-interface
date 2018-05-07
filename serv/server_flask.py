#!/usr/bin/env python2.7
"""
@author Alex Haggart, Simon Fong
@email ?, simonfong6@gmail.com
"""

import sys
import json
import numpy as np
import time
from flask import Flask, request, session, g, jsonify
from flask_cors import CORS
from KinematicModel import KinematicModel
from threading import Thread

POST_SUCCESS    = "SUCC"
POST_FAIL       = "ZUCC"

class ControlProcessor:
    def __init__(self,model):
        self.model = model
        self.running = lambda: True

    def start(self):
        thread = Thread(group=None,target=self.update_configuration)
        thread.start()
        return thread

    def update_configuration(self):
        last_print = 0
        while self.running():
            if not self.model.configured():
                self.model.update()
        # if time.time() - last_print > 1:
        #   last_print = time.time()
        #   print(self.model.end_affector)
        print("Processing thread closing...")

    def kill(self):
        self.running = lambda: False



precision=0.001

start_configuration = {
    "base0":0,
    "joint0":np.pi/2,
    "joint1":-np.pi/2,
    "joint2":-np.pi/2,
    "finger00":-np.pi/3,"finger01":np.pi/3,
    "finger10":np.pi/3,"finger11":-np.pi/3,
}

joint_map = [
    "base0",
    "joint0",
    "joint1",
    "joint2"
]

model = KinematicModel(start_configuration,joint_map,precision)

app = Flask(__name__)   # Create the application instance :)
CORS(app)               # Allow CORS (Cross Origin Requests)

@app.route('/', methods=['GET', 'POST'])
def root():
    """
    Case: {u'action': u'set_goal', u'data': [1, 1, 1]}
        Does inverse kinematics to get to goal.
        
    Case: {u'action': u'reset'}
        Resets arm to original location.
    """
    # Load json as a dict
    payload = request.json
    
    # Fail if no json in request
    if(not payload):
        return POST_FAIL
        
    print("Payload: {}".format(payload))
    
    if("set_goal" in payload['action']):
        print("setting goal to: {}".format(payload['data']))
        model.set_goal(payload["data"])
    elif("reset" in payload['action']):
        print("Resetting arm to original location.")
        model.reset()
    
    # Success
    return POST_SUCCESS
    
@app.route('/status')
def status():
    
    # return json.dumps(model.configuration)   
    return jsonify(model.configuration)     # Replacing Haggaart's json.dumps
                                            # Creates a Flask.Response() obj

@app.route('/joystick',methods=['GET','POST'])
def joystick():
    # Load json as a dict
    payload = request.json
    
    # Fail if no json in request
    if(not payload):
        return POST_FAIL

    # do some stuff with the joystick data depending on the drive type
        
    print("Payload: {}".format(payload))
    return POST_SUCCESS

@app.route('/kill',methods=['POST'])
def kill():
    payload = request.json

    if not payload:
        return POST_FAIL

    if payload['action'] == "unkill":
        print("unkilling motors")
        pass # unkill the motors
    else:
        print("killing motors")
        pass # kill the motors: pass invalid data to motor topic

    return POST_SUCCESS

if(__name__ == '__main__'):
    PORT = int(sys.argv[1])
    

    node = ControlProcessor(model)
    thread = node.start()
    
    # Will run on http://localhost:PORT
    # OR IPADDRESS:PORT
    print("Listening on http://localhost:{}".format(PORT))
    app.run(host='0.0.0.0', port=PORT, threaded=True)
    
    node.kill()
    print("Thread killed")
    
    
    
    
