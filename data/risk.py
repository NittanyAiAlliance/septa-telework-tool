import pandas as pd
import numpy as np
import requests
import json
import os

def occupation_estimate(state=None,county=None,metropolitan=None):
    if state ==None and county == None and metropolitan != None:
        url = "https://api.census.gov/data/2018/acs/acs5/profile?get=NAME,DP03_0001E,DP03_0027E,DP03_0028E,DP03_0029E,DP03_0030E,DP03_0031E&for=metropolitan%20statistical%20area/micropolitan%20statistical%20area:"+str(metropolitan)+"&key=bf2a5abb0288a6187641bb539344cde1f7bdaf76"
    elif state != None and county != None and metropolitan == None:
        url = "https://api.census.gov/data/2018/acs/acs5/profile?get=NAME,DP03_0001E,DP03_0027E,DP03_0028E,DP03_0029E,DP03_0030E,DP03_0031E&for=tract:*&in=state:"+str(state)+"%20county:"+str(county)+"&key=bf2a5abb0288a6187641bb539344cde1f7bdaf76"
    else:
        return None
    d1 = {}
    weights = [0.82,0.37,0.28,0.01,0.01]
    data = requests.get(url)
    output = data.json()[1:]

    for element in output:
        values = [int(x) for x in element[2:7]]
        if int(element[1]) != 0:
           return  np.dot(values, weights) / int(element[1])
        else:
            return  None


def industry_estimate(state=None,county=None,metropolitan=None):
    if state ==None and county == None and metropolitan != None:
        url = "https://api.census.gov/data/2018/acs/acs5/profile?get=NAME,DP03_0001E,DP03_0033E,DP03_0034E,DP03_0035E,DP03_0036E,DP03_0037E,DP03_0038E,DP03_0039E,DP03_0040E,DP03_0041E,DP03_0042E,DP03_0043E,DP03_0044E&for=metropolitan%20statistical%20area/micropolitan%20statistical%20area:"+str(metropolitan)+"&key=bf2a5abb0288a6187641bb539344cde1f7bdaf76"
    elif state != None and county != None and metropolitan == None:
        url = "https://api.census.gov/data/2018/acs/acs5/profile?get=NAME,DP03_0001E,DP03_0033E,DP03_0034E,DP03_0035E,DP03_0036E,DP03_0037E,DP03_0038E,DP03_0039E,DP03_0040E,DP03_0041E,DP03_0042E,DP03_0043E,DP03_0044E&for=tract:*&in=state:"+str(state)+"%20county:"+str(county)+"&key=bf2a5abb0288a6187641bb539344cde1f7bdaf76"
    else:
        return None
    d2 = {}
    weights = [0.08, 0.19, 0.22, 0.52, 0.14, 0.19, 0.72, 0.76, 0.8, 0.3, 0.31, 0.41]
    data = requests.get(url)

    output = data.json()[1:]


    for element in output:
          values = [int(x) for x in element[2:14]]
          if int(element[1]) != 0:
              return np.dot(values, weights) / int(element[1])
          else:
              return None





def get_column_names():
    df = pd.read_csv("ACSDP5Y2018.DP03_data_with_overlays_2020-07-13T131015.csv")
    final = ['name']
    for i in 'DP03_0001E,DP03_0033E,DP03_0034E,DP03_0035E,DP03_0036E,DP03_0037E,DP03_0038E,DP03_0039E,DP03_0040E,DP03_0041E,DP03_0042E,DP03_0043E,DP03_0044E'.split(","):
        final.append(str(df[i].iloc[0].split("!!")[-1]))
    print(final)

def get_msa_predict():

    url = 'https://raw.githubusercontent.com/jdingel/DingelNeiman-workathome/master/MSA_measures/output/MSA_workfromhome.csv'
    response = requests.get(url)
    print(response)
    with open(os.path.join(os.getcwd(), "MSA.csv"), 'wb') as f:
        f.write(response.content)
def get_training_data():
    df = pd.read_csv('MSA.CSV')
    training_data = {}
    training_data['industry'] = []
    training_data['occupation'] = []
    training_data['estimated'] = []
    for index,row in df.iterrows():
        training_data['industry'].append(industry_estimate(metropolitan=row['AREA']))
        training_data['occupation'].append(occupation_estimate(metropolitan=row['AREA']))
        training_data['estimated'].append(row['teleworkable_manual_emp'])
        print(row['AREA'])
    final = pd.DataFrame(data=training_data)
    final.to_csv('data.csv',index=False)

get_training_data()
#get_msa_predict()

#get_column_names()
#dx=(industry_estimate())


#with open('data.json', 'w') as f:
#    json.dump(d, f)

