import requests
from bs4 import BeautifulSoup
import csv
import pandas as pd
import re
import json
from tqdm import tqdm
from crossref.restful import Works
import time



df = pd.read_json("progetto\datasets\PMID_dataset.json")

df = df[['DOI','PMID']]
DOIS = df['DOI'].values.tolist()
PMIDS = df['PMID'].values.tolist()
    

data = []
for i in tqdm(range(0, len(DOIS))):
 
    
    if(PMIDS[i] != ""): 
        

        n_page = 1
        entry = {"DOI": DOIS[i], "PMID": PMIDS[i], "citedBy":[]}
        while(True):
            
            page = requests.get("https://pubmed.ncbi.nlm.nih.gov/?linkname=pubmed_pubmed_citedin&from_uid="+PMIDS[i]+"&page="+str(n_page))
            
            if (page.status_code == 200):
                soup = BeautifulSoup(page.content, 'html.parser').findAll("span", attrs={"class": "docsum-pmid"})
                if(
                    "Cited" not in str(BeautifulSoup(page.content, 'html.parser').findAll("h1", attrs={"class": "page-header"}))
                ): break
                
                #.find("div", attrs={"id": "citedby"}).find("a", attrs={"data-ga-category": "cited_by","data-ga-action": "show_all" })
                for j in soup:
                    elem = re.findall(r'(?<=>)(.*)(?=<)',str(j))[0]
                    if(elem != PMIDS[i]): entry['citedBy'].append(elem)
            else : break
            
            
            tot_pages_container = BeautifulSoup(page.content, 'html.parser').find("label", attrs={"class": "of-total-pages"})
            
           
            if(str(n_page) == tot_pages_container.text.split()[1]): break
            n_page+=1
        
        data.append(entry)
    else:
        data.append({"DOI": DOIS[i], "PMID": "", "citedBy":[]})
         
    if(i % 1000 == 0):
            name = str(i -1000) +"-" + str(i) +".json"
            with open(name, 'w') as f:
                json.dump(data, f)

    
    
with open('cited_.json', 'w') as f:
    json.dump(data, f)


