import pandas as pd
import json
from tqdm import tqdm
from crossref.restful import Works
import time

df = pd.read_json(".\datasets\cut_dataset.json")

df = df[['DOI']]
DOIS = df['DOI'].values.tolist()

works = Works()
data = []
for i in tqdm(range(0, len(DOIS))):

    doc = works.doi(DOIS[i]+"?mailto=vennerigiacomo98@gmail.com")

    if(doc != None):

        if((doc.keys() != None) & ('URL' in doc.keys())):
            url = doc['URL']
        else: 
            url = ""

        if((doc.keys() != None) & ('reference' in doc.keys())):
            refs = doc['reference']
        else: 
            refs = {}

        entry = {"DOI": DOIS[i], "URL": url,  "references": []}

        for j in refs:
        
            if('DOI' in j.keys()): entry["references"].append(j['DOI'])

        data.append(entry)
        time.sleep(0.2) # Sleep for 0.2 seconds, I hope that they will not block the requests.
        if(i % 1000 == 0):
            name = str(i -1000) +"-" + str(i) +".json"
            with open(name, 'w') as f:
                json.dump(data, f)
        
'''
with open('references.json', 'w') as f:
    json.dump(data, f)
'''

            

    
    