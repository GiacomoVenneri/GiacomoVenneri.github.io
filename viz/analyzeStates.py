import pandas as pd

data_df = pd.read_csv('out.csv')

states_df = data_df[['Nation']]

print(states_df.groupby(['Nation']).count())