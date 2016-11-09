import copy
from pymongo import MongoClient
client = MongoClient('localhost',27017)
db = client["room-allocation"]
cursor = db.users.find()
guyprefers=dict()
for document in cursor:
    try:
        dicto = document["friendPriority"]
	noise = document["noise"]
	light = document["light"]
        name = document["username"]
        guyprefers[name]=[]
        temp=[]
        for param in dicto:
	    prior=param["value"]
   	    prior = prior + 5*abs(noise - db.users.findOne({"username":param["friend"]})["noise"]) + 5*abs(light - db.users.findOne({"username":param["friend"]})["light"])
            temp.append((prior,str(param["friend"])))
        temp.sort()
        for param in temp:
                guyprefers[name].append(param[1])
    except:
        continue
#print guyprefers
'''
guyprefers = {
 '1':  ['2', '3', '4', '1'],
 '2':  ['3', '4', '1', '2'],
 '3':  ['4', '1', '2', '3'],
 '4':  [ '1', '2', '3', '4']}'''
'''guyprefers = {'tom': ['dick', 'jedi', 'luke', 'voldemort', 'darth', 'dumbledore', 'harry', 'pikachu', 'strange'],'dumbledore': ['harry', 'luke', 'voldemort', 'darth', 'dick', 'jedi', 'pikachu', 'strange', 'tom'], 'luke': ['darth', 'dumbledore', 'jedi', 'dick', 'dude', 'harry', 'pikachu', 'strange', 'tom', 'voldemort'], 'pikachu': ['darth', 'dick', 'jedi', 'dumbledore', 'harry', 'luke', 'strange', 'tom', 'voldemort'], 'dick': ['dumbledore', 'tom', 'voldemort', 'darth', 'jedi', 'strange', 'harry', 'luke', 'pikachu'], 'darth': ['dumbledore', 'harry', 'luke', 'dick', 'jedi', 'pikachu', 'strange', 'tom', 'voldemort'], 'voldemort': ['dumbledore', 'harry', 'luke', 'darth', 'dick', 'jedi', 'pikachu', 'strange', 'tom'], 'jedi': ['dick', 'dumbledore', 'harry', 'voldemort', 'darth', 'luke', 'pikachu', 'strange', 'tom'], 'strange': ['darth', 'dick', 'harry', 'luke', 'dumbledore', 'jedi', 'pikachu', 'tom', 'voldemort'], 'harry': ['dumbledore', 'jedi', 'luke', 'darth', 'dick', 'pikachu', 'strange', 'tom', 'voldemort']}'''
guys = sorted(guyprefers.keys())
gals = sorted(guyprefers.keys())

#print guys
#print gals

def check(engaged):
    inverseengaged = dict((v,k) for k,v in engaged.items())
    for she, he in engaged.items():
        shelikes = galprefers[she]
        shelikesbetter = shelikes[:shelikes.index(he)]
        helikes = guyprefers[he]
        helikesbetter = helikes[:helikes.index(she)]
        for guy in shelikesbetter:
            guysgirl = inverseengaged[guy]
            guylikes = guyprefers[guy]
            if guylikes.index(guysgirl) > guylikes.index(she):
                print("%s and %s like each other better than "
                      "their present partners: %s and %s, respectively"
                      % (she, guy, he, guysgirl))
                return False
        for gal in helikesbetter:
            girlsguy = engaged[gal]
            gallikes = galprefers[gal]
            if gallikes.index(girlsguy) > gallikes.index(he):
                print("%s and %s like each other better than "
                      "their present partners: %s and %s, respectively"
                      % (he, gal, she, girlsguy))
                return False
    return True
 
def matchmaker():
    guysfree = guys[:]
    engaged  = {}
    guyprefers2 = copy.deepcopy(guyprefers)
    galprefers2 = copy.deepcopy(guyprefers)
#    print guyprefers2
    while guysfree:
        guy = guysfree.pop(0)
        guyslist = guyprefers2[guy]
        gal = guyslist.pop(0)
	wif = engaged.get(guy)
        fiance = engaged.get(gal)
#	print("before condition")
#	print guy,gal,wif,fiance
        if not fiance and not wif:
#	    print fiance,wif	
            # She's free
            engaged[gal] = guy
            engaged[guy] = gal
            guysfree.remove(gal)
#	    print engaged
#            print("  %s and %s" % (guy, gal))
        else:
            # The bounder proposes to an engaged lass!
            galslist = galprefers2[gal]
            if galslist.index(fiance) > galslist.index(guy):
                # She prefers new guy
                engaged[gal] = guy
	        engaged[guy] = gal
		del engaged[fiance]
#                print("  %s dumped %s for %s" % (gal, fiance, guy))
                if guyprefers2[fiance]:
                    # Ex has more girls to try
                    guysfree.append(fiance)
            else:
                # She is faithful to old fiance
                if guyslist:
                    # Look again
                    guysfree.append(guy)
    return engaged
 
 
#print('\nEngagements:')
engaged = matchmaker()
#print engaged
cursor = db.users.find()
for document in cursor:
	name = document["username"]
        #print name
	result=db.users.update_one({"username": name},{"$set": {"roomie":engaged[name]}})	
