#!/usr/bin/env python2.7
import numpy as np
import time
from solve_kinematics import KinematicSolver

class KinematicModel:
  def __init__(self,start_configuration,joint_order,precision=0.001,step_size=10):
    self.solver = KinematicSolver()
    self.goal = np.array([[0,0,0]])
    self.new_goal = True
    self.end_affector = np.array([[0,0,0]])
    self.configuration = start_configuration
    self.joint_order = joint_order
    self.precision = precision
    self.step_size = step_size
    self.last_update = 0
    self.path = []

  def goal(self,goal):
    # grab only the first three elements of whatever we got
    self.goal = np.array(goal[0:3]).reshape(1,3)
    self.new_goal = True

  def configured(self):
    return np.sum(np.square(self.end_affector - self.goal)) > self.precision**2

  def update(self):
    delta = time.time() - self.last_update
    self.last_update = time.time()
    # update actuators based on delta time
    # poll actuator list for current joint positions and movement status
    # update configuration to reflect current position
    # check if goal has changed
    if self.new_goal:
      # get a path towards the goal
      # override current actuator action for new path
      pass
    else:
      # if all actuators have resolved their movement, feed them the next point along current path
      pass
    self.new_goal = False

  def __build_joint_list__(self):
    return [self.configuration[joint] for joint in joint_order]