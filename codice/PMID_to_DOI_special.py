import requests
from bs4 import BeautifulSoup
import csv
import pandas as pd
import re
import json
from tqdm import tqdm
from crossref.restful import Works
import time



df = pd.read_json(".\data_complete.json")

DOIS = df['DOI'].values.tolist()
C_BY = df["citedBy"]
    
root = "https://www.ncbi.nlm.nih.gov/pmc/utils/idconv/v1.0/?email=vennerigiacomo98@gmail.com&"

data = []

for i in tqdm(range(0, len(DOIS))):
    
    entry = {"DOI": DOIS[i], "citedBy": []}
    if(len(C_BY[i])>0):
        for j in range(0, len(C_BY[i])):
           

            page = requests.get(root+"ids="+C_BY[i][j])
            
            
            if (page.status_code == 200):
                soup = BeautifulSoup(page.content, 'html.parser')
                records = str(soup.findAll("record"))
                cby_dois=re.findall(r'(?<=doi=")([^ ]*)(?=" )',records)
                if(len(cby_dois) >0):
                    entry["citedBy"].append(cby_dois[0])
         
            else:
                print("errore", C_BY[i][j])
            
    data.append(entry)
    if(i % 1000 == 0):
        name = str(i -1000) +"-" + str(i) +".json"
        with open(name, 'w') as f:
            json.dump(data, f)
        



with open('del.json', 'w') as f:
    json.dump(data, f)


