#!/usr/bin/env python2.7
import sys
import json
import numpy as np
import time
from flask import Flask, request, session, g
from KinematicModel import KinematicModel
from threading import Thread

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

app = Flask(__name__) # create the application instance :)

@app.route('/', methods=['GET', 'POST'])
def root():
    return None
    
@app.route('/status')
def status():
    return json.dumps(model.configuration)    

if(__name__ == '__main__'):
    PORT = int(sys.argv[1])
    

    
    
    
    app.run(host='0.0.0.0', port=PORT, threaded=True)
