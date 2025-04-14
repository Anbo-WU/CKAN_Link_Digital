

rootfile = '数据.csv'
import pandas as pd
import  os
if __name__ == '__main__':
    if os.path.exists(rootfile):
        df = pd.read_csv(rootfile,sep='；')
        df.to_excel(rootfile.replace('.csv','.xlsx'),index=False)
    
    pass