#!/usr/bin/python

import urllib2, base64
import ConfigParser


# ---------------------------------------------------------------------------------

def printTasks(json):
    import ast
    # Convert (deserialize) the string (which is JSON) into a python object
    theDict=ast.literal_eval(json);
    theResponse=theDict['rsp']['tasks']['list'];
    print(type(theResponse));
    print(theResponse);
    print
    
    i = 0;
    for s in theResponse:
        t = s['taskseries']
        print (type(t))
        

        # Check to see if there's a dict (one item) or a list (multiple items)
        if (type(t) is dict):
            # Just one items (so dict)
            print "Series " + str(i) + ": " + t['name']
        elif (type(t) is list):
            # Multiple items (so list of dicts)
            # Loop through the list
            for w in t:
                print "Series " + str(i) + ": " + w['name']
        i += 1;

# ---------------------------------------------------------------------------------

# Read in the configuration file 
Config = ConfigParser.ConfigParser()
Config.read("./.leankit.config")

# Grab the important config params from the file we just read
email = Config.get("IrisPlatform", "email")
password = Config.get("IrisPlatform", "password")

req="https://jnj.leankit.com/kanban/api/board/372745411"
req="https://jnj.leankit.com/kanban/api/board/372745411/getboardidentifiers"

request = urllib2.Request(req)
base64string = base64.encodestring('%s:%s' % (email, password)).replace('\n', '')
request.add_header("Authorization", "Basic %s" % base64string)   

# Gets HTML response. Gives access to the headers via the info() method
response = urllib2.urlopen(request)
#response.close()

#
print "The Headers are: ", response.info()

# This is the response payload
jsonString = response.read()

print "jsonstring\n-------------------"
print jsonString;
print

import json
#data = json.loads(response.read().decode(response.info().get_param('charset') or 'utf-8'))

#data = json.loads(response.read().decode('utf-8'))
# No Json object

data = json.loads(jsonString)
print ("JSON Object\n------------------")
print data
print

print ("Testing\n--------------------")
print data['ReplyText']
print data['ReplyData'][0]['Lanes'][0]['Name']
print


