import pandas as pd
import json


df = pd.read_json("datasets\dataset_raw_7001.json")
df2 = pd.read_json("datasets\dataset_between_7001.json")
df3 = pd.read_json("datasets\dataset_indeg_7001.json")


data = df.to_json(orient = "records")
data2 = df2.to_json(orient = "records")
data3 = df3.to_json(orient = "records")
data = json.loads(data)
data2 = json.loads(data2)
data3 = json.loads(data3)
print(len(data))
print(len(data2))
print(len(data3))



df_out = pd.merge(df, df2, on='DOI', how='left')
df_out = pd.merge(df_out, df3, on='DOI', how='left')

data_out = df_out.to_json(orient = "records")
data_out = json.loads(data_out)
print(len(data_out))



with open('dataset_complete_7001.json', 'w') as f:
    json.dump(data_out, f, indent = 4)


'''
df_out = pd.read_json(".\progetto\datasets\\dataset_raw_7001.json").rename(columns={"references": "reference_to"})
data_out = df_out.to_json(orient = "records")
data_out = json.loads(data_out)
with open('del.json', 'w') as f:
    json.dump(data_out, f, indent = 4)
'''