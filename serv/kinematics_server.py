#!/usr/bin/env python2.7
import HTTPComputeNode
import sys
import json
import numpy as np
import time
import solve_kinematics

class KinematicsProcessor:
  def __init__(self,start_configuration):
    self.joint_configuration = start_configuration
    self.ts = time.time()
    pass

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
      print(payload)
      wfile.write(json.dumps(payload))
    else:
      wfile.write("content-type not recognized")

  def get_processor(self,content_type,wfile):
    delta = (self.ts - time.time()) / 100.0 #ms
    print(delta)
    self.ts = time.time()
    self.joint_configuration["joint1"] = self.joint_configuration["joint1"] + delta
    wfile.write(json.dumps(self.joint_configuration))

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

  kp = KinematicsProcessor(start_configuration)

  node = HTTPComputeNode.ComputeNode(("",PORT),kp.processors())
  print(node.server_address)
  node.start()