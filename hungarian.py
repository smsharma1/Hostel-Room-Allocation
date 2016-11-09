from munkres import Munkres, print_matrix
from pymongo import MongoCient
from operator import add
client = MongoClient('localhost',27017)
db = client["room-allocation"]
cursor = db.users.find()
roomie=dict()
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
		for param in roomprior:
			temp.append((param["room"],param["value"]))
		temp.sort()
		for param in temp:
			priority[name].append(param[1])
	except:
		continue
pair=[]
guys1=guys
matrix=[]
for guy in guys1:
	if guy in guys:
		temp=[]
		partner=roomie[guy]
		pair.append((guy,roomie))
		matrix.append(map(add,priority[guy],priority[partner]))
		guys.remove(partner)
	else:
		continue	
print matrix
m = Munkres()
indexes = m.compute(matrix)
print_matrix(matrix, msg='Lowest cost through this matrix:')
total = 0
for row, column in indexes:
    value = matrix[row][column]
    total += value
    print '(%d, %d) -> %d' % (row, column, value)
print 'total cost: %d' % total
