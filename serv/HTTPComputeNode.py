#!/usr/bin/env python2.7

import SimpleHTTPServer
import SocketServer
import sys
import time
import signal
import json

class ComputeNodeAPI(SimpleHTTPServer.SimpleHTTPRequestHandler):
  def __init__(self,request,client_address,server):
    SimpleHTTPServer.SimpleHTTPRequestHandler.__init__(self,request,client_address,server)

  def do_POST(self):

    content_len = int(self.headers.getheader('content-length', 0))
    payload = self.rfile.read(content_len)
    print(payload)
    print("{}: {}".format(time.time(),self.headers.getheader('content-type','not found')))
    self.send_response(200,"OK")
    self.send_header("Access-Control-Allow-Origin","http://localhost:8080")
    self.end_headers()
    # self.wfile.write("hello ack")

    # send the content-type,query string, and stream to processor object
    content_type = self.headers.getheader('content-type',None);
    self.server.controller_args['post_processor'](content_type,payload,self.wfile)

  def do_GET(self):
    self.send_response(200,"OK")
    self.send_header("Access-Control-Allow-Origin","http://localhost:8080")
    self.end_headers()

    # send the content-type,query string, and stream to processor object
    content_type = self.headers.getheader('content-type',None);
    self.server.controller_args['get_processor'](content_type,self.wfile)

  def do_OPTIONS(self):
    self.send_response(200,"OK")
    # support for CORS stuff
    self.send_header("Access-Control-Allow-Origin","http://localhost:8080")
    self.send_header("Access-Control-Allow-Headers","content-type,goalv")
    self.send_header("Access-Control-Allow-Methods","POST,GET")


class ComputeNode(SocketServer.TCPServer):
  def __init__(self,server_address,controller_args={},bind_and_activate=True):
    SocketServer.TCPServer.__init__(self,server_address,ComputeNodeAPI,bind_and_activate)
    self.controller_args = controller_args

  def start(self):
    try:
      self.serve_forever()
    except KeyboardInterrupt:
      print("\nShutting down server...")
      self.shutdown();
      self.server_close();