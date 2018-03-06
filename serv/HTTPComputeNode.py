#!/usr/bin/env python2.7

import SimpleHTTPServer
import SocketServer
import sys
import time
import signal

PORT = int(sys.argv[1])

class ComputeNodeAPI(SimpleHTTPServer.SimpleHTTPRequestHandler):
  def __init__(self,request,client_address,server):
    SimpleHTTPServer.SimpleHTTPRequestHandler.__init__(self,request,client_address,server)

  def do_GET(self):

    # content_len = int(self.headers.getheader('content-length', 0))
    # post_contents = self.rfile.read(content_len)
    print("{}: {}".format(time.time(),self.headers.getheader('goalv','not found')))
    self.send_response(200,"OK")
    self.send_header("Access-Control-Allow-Origin","http://localhost:8080")
    self.end_headers()
    self.wfile.write("hello ack")

    # send the content-type,query string, and stream to processor object

  def do_OPTIONS(self):
    self.send_response(200,"OK")
    # support for CORS stuff
    self.send_header("Access-Control-Allow-Origin","http://localhost:8080")
    self.send_header("Access-Control-Allow-Headers","content-type,goalv")
    self.send_header("Access-Control-Allow-Methods","GET")

class ComputeNode(SocketServer.TCPServer):
  def __init__(self,server_address,RequestHandlerClass,controller_args={},bind_and_activate=True):
    SocketServer.TCPServer.__init__(self,server_address,RequestHandlerClass,bind_and_activate)
    self.controller_args = controller_args

def keyboard_interrupt():
  sys.exit(0);

def init():
  signal.signal(signal.SIGINT,keyboard_interrupt)
  handler = ComputeNodeAPI
  httpd = ComputeNode(("",PORT),handler,{})

  print(httpd.server_address)

  try:
    httpd.serve_forever()
  except:
    print("***\nException raised\n***\nclosing server...")
    httpd.shutdown();
    httpd.server_close();

if __name__ == "__main__":
  init()