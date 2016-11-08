from match import Matcher
import json
from pymongo import MongoClient
client = MongoClient('localhost',27017)
db = client["room-allocation"]
cursor = db.users.find()
M=dict()
for document in cursor:
    try:
        dicto = document["friendPriority"]
        name = document["name"]
	M[name]=[]
        temp=[]
        for param in dicto:
            temp.append((param["value"],str(param["friend"])))
        temp.sort()
	for param in temp:
		M[name].append(param(0))
    except:
        continue
print M

# the men and their list of ordered spousal preferences
#M = dict((m, prefs.split(', ')) for [m, prefs] in (line.rstrip().split(': ')
#                                for line in open('men.txt')))
#print M
# the women and their list of ordered spousal preferences
#W = dict((m, prefs.split(', ')) for [m, prefs] in (line.rstrip().split(': ')
#                                for line in open('women.txt')))
M = W

# initialize Matcher with preference lists for both men and women
match = Matcher(M, W)

# check if the mapping of wives to husbands is stable
def is_stable(wives, verbose=False):
    for w, m in wives.items():
        i = M[m].index(w)
        preferred = M[m][:i]
        for p in preferred:
            h = wives[p]
            if W[p].index(m) < W[p].index(h):  
                msg = "{}'s marriage to {} is unstable: " + \
                      "{} prefers {} over {} and {} prefers " + \
                      "{} over her current husband {}"
                if verbose:
                    print msg.format(m, w, m, p, w, p, m, h) 
                return False
    return True

# match men and women; returns a mapping of wives to husbands
wives = match()
print wives
assert is_stable(wives)             # should be a stable matching
assert match.is_stable()            # should be a stable matching


assert is_stable(wives) is False    # should not be a stable matching

# with the perturbed matching we find that gav's marriage to fay is unstable: 
#
#   * gav prefers gay over fay 
#   * gay prefers gav over her current husband dan
