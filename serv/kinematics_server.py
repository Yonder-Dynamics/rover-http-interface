#!/usr/bin/env python2.7
import HTTPComputeNode
import sys
import json
import numpy as np
import time
from KinematicModel import KinematicModel
from threading import Thread

class KinematicsProcessor:
  def __init__(self,start_configuration,joint_map,precision=0.001):
    self.model = KinematicModel(start_configuration,joint_map,precision)
    self.running = lambda: True

  def processors(self):
    return {
      "get":{
        "processor":self.get_processor,
      },
      "post":{
        "processor":self.post_processor,
      },
    }

  def post_processor(self,content_type,payload,wfile):
    if "application/json" in content_type:
      payload = json.loads(payload)
      # now parse the payload
      if "goal" in payload:
        self.model.goal(payload["goal"])
    else:
      wfile.write("content-type not recognized")

  def get_processor(self,content_type,wfile):
    wfile.write(json.dumps(self.model.configuration))

  def start(self):
    thread = Thread(group=None,target=self.update_configuration)
    thread.start()
    return thread

  def update_configuration(self):
    while self.running():
      if not self.model.configured():
        self.model.update()
    print("Processing thread closing...")

  def kill(self):
    self.running = lambda: False



if __name__ == "__main__":
  PORT = int(sys.argv[1])


  start_configuration = {
    "base0":0,
    "joint0":np.pi/4,
    "joint1":-np.pi/4,
    "joint2":-np.pi/4,
    "finger00":-np.pi/3,"finger01":np.pi/3,
    "finger10":np.pi/3,"finger11":-np.pi/3,
  }

  joint_map = {}

  kp = KinematicsProcessor(start_configuration,joint_map)

  node = HTTPComputeNode.ComputeNode(("",PORT),kp.processors())
  print(node.server_address)

  kp.running = node.running

  thread0 = kp.start()
  node.start()
  kp.kill() # kill the processing thread if the server goes down