from munkres import Munkres, print_matrix
from pymongo import MongoClient
from operator import add
client = MongoClient('localhost',27017)
db = client["room-allocation"]
cursor = db.users.find()
roomie=dict()
room = []
priority=dict()
guys=[]
for document in cursor:
        try:
		roomprior=document["roomPriority"]
		name=document["username"]
		guys.append(name)
		partner=document["roomie"]
		roomie[name]=partner
		temp=[]
                priority[name]=[]
		for param in roomprior:
			temp.append((param["room"],param["value"]))
		temp.sort()
		for param in temp:
			priority[name].append(param[1])
	except:
		continue
for param in temp:            
        room.append(param[0])
pair=[]
guys1=guys
t = dict()
matrix=[]
for guy in guys1:
	if guy in guys:
		temp=[]
		partner=roomie[guy]
		pair.append((guy,partner))
		matrix.append(map(add,priority[guy],priority[partner]))
		guys.remove(partner)
                t[guy] = map(add,priority[guy],priority[partner])
	else:
		continue	
m = Munkres()
indexes = m.compute(matrix)
i = 0
myroom = dict()
for row, column in indexes:
    value = matrix[row][column]
    myroom[pair[i][0]]=room[column]
    myroom[pair[i][1]]=room[column]
    i += 1
cursor = db.users.find()
for document in cursor:
    name = document["username"]
    result = db.users.update_one({"username":name},{"$set":{"finalRoom":myroom[name]}})
