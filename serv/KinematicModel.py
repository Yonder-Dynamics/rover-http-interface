#!/usr/bin/env python2.7
import numpy as np
import time
from solve_kinematics import KinematicSolver
from collections import deque


class ArmDriver:
  def __init__(self,actuators):
    self.actuators = actuators
    self.configuration = []

  def update(self,delta):
    for actuator in self.actuators:
      actuator.udpate(delta)
    self.configuration = [act.configuration for act in self.actuators]

  def actuate(self,goal_angles):
    for i in range(0,len(self.goal)):
      self.actuators[i].actuate(goal_angles[i])

  def done(self):
    return all([act.done() for act in self.actuators])


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
    self.driver = ArmDriver()

  def goal(self,goal):
    # grab only the first three elements of whatever we got
    self.goal = np.array(goal[0:3]).reshape(1,3)
    self.new_goal = True

  def configured(self):
    return np.sum(np.square(self.end_affector - self.goal)) > self.precision**2

  def update(self):
    delta = time.time() - self.last_update
    self.last_update = time.time()
    self.driver.update(delta)
    # update configuration to reflect current position
    self.configuration = driver.configuration
    self.end_affector = self.solver.end_affector(self.configuration)

    # check if goal has changed
    if self.new_goal:
      # get a path towards the goal
      path = [wp for wp in self.solver.generate_path_to_point(self.end_affector,self.goal)].reverse()
      # override current actuator action for new path
      self.driver.actuate(self.path.pop())
    else:
      # if all actuators have resolved their movement, feed them the next point along current path
      if self.driver.done() and len(self.path) > 0:
        self.driver.actuate(self.path.pop()) # TODO: make sure this is the right data type
    self.new_goal = False # if we had a new goal, it has now been processed

  def __build_joint_list__(self):
    return [self.configuration[joint] for joint in joint_order]