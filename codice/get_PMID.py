import requests
from bs4 import BeautifulSoup
import csv
import pandas as pd
import re
import json
from tqdm import tqdm
from crossref.restful import Works
import time



df = pd.read_json(".\progetto\datasets\\references_dataset.json")

df = df[['DOI']]
DOIS = df['DOI'].values.tolist()
#TITLES = df['Title'].values.tolist()
    
root = "https://www.ncbi.nlm.nih.gov/pmc/utils/idconv/v1.0/?email=vennerigiacomo98@gmail.com&"

data = []

for i in tqdm(range(0, len(DOIS))):
    page = requests.get(root+"ids="+DOIS[i])

    if (page.status_code == 200):
        soup = BeautifulSoup(page.content, 'html.parser')
        pubmed_id = str(soup.find("record"))
        pmid=re.findall(r'(?<=pmid=")([0-9]*)(?=")',pubmed_id)

        if(len(pmid)>0): pmid = pmid[0]
        else : pmid = ""

        entry = {"DOI": DOIS[i], "PMID": pmid}
        data.append(entry)

        
       
    else:
        print("errore")

    if(i% 1000 == 0):
        name = str(i -1000) +"-" + str(i) +".json"
        with open(name, 'w') as f:
            json.dump(data, f)

with open('del.json', 'w') as f:
    json.dump(data, f)

