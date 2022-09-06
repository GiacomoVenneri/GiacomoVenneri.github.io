import pandas as pd
import json

df = pd.read_json(".\datasets\Dataset210215ClassificationCleaned_tSNE.json")

data = df[["DOI","Title", "First_author", "Nation", "Publish_time", "Journal", "Topic"]].drop_duplicates(subset="DOI").head(10000)
data = data.to_json(orient = "records")
data = json.loads(data)
print(len(data))

with open('cut_dataset.json', 'w') as f:
    json.dump(data, f, indent = 4)


