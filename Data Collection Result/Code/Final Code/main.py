# This code is a web scraper designed to collect property listings and details from the website "domain.com.au."

import httpx
from loguru import logger
class Requests():
    def __init__(self):
        # self.proxies = {
        #     "all://":'http://127.0.0.1:10087'
        # }
        self.proxies = None
        pass

    # the post request function
    # Sends a POST request to a given URL with optional headers, params, data, or JSON.
    def Post(self, url: str, headers=None, params=None, data=None, json_=None):
        while True:
            try:
                # headers['Cookie'] = self.Cookie
                res = httpx.post(url=url, headers=headers, params=params, data=data, json=json_, timeout=60,proxies=self.proxies)
                break
            except Exception as e:
                logger.error(f'请求报错{e}')
        return res

    # the get request function
    # Sends a GET request to a given URL with optional headers and params.
    def Get(self, url: str, headers=None, params=None, ):
        while True:
            try:
                res = httpx.get(url=url, headers=headers, params=params, timeout=60,proxies=self.proxies)
                break
            except Exception as e:
                logger.error(f'请求报错{e}{url}')
        return res



# instanize the request class
pool = Requests()

# getlist function
# Iterates over price ranges in steps of 50 and pages of listings (page=1).
# Sends GET requests to fetch the listings data.
# If listings are found, it extracts URLs of individual listings and processes them using ThreadPoolExecutor for concurrent handling.
# Calls the GetDetail function for each listing URL.
def GetList():
    url = "https://www.domain.com.au/rent/"
    headers = {
        "accept": "application/json",
        "accept-encoding": "gzip, deflate, br",
        "accept-language": "zh-CN,zh;q=0.9",
        "cache-control": "no-cache",
        # "cookie": "_gcl_au=1.1.1662210340.1725340064; domain-mixpanel-id_ab0bde70050c3eabaaf8824402fa01e0=$device:191b648213911c7-0b34d4f40607a1-2003037d-144000-191b648213911c7; _hjSessionUser_966278=eyJpZCI6IjU3YTFlN2NhLTJkYTctNTRlOC1hZmZiLWI5YjcyMjU4YmVkZiIsImNyZWF0ZWQiOjE3MjUzNDAwNjY0MTgsImV4aXN0aW5nIjp0cnVlfQ==; DM_SitId1455=1; DM_SitId1455SecId12673=1; DEVICE_SESSIONID=7d75026e-6e27-4660-a498-7fd14ddd8cf8; NUID=28a72632beef44daa4baac768218a9b4; DM_SitId1455SecId12671=1; _pbjs_userid_consent_data=3524755945110770; _gid=GA1.3.1999125749.1725965218; searchSOI=act; _lr_geo_location=CN; _clck=1k78z9j%7C2%7Cfp2%7C0%7C1707; bm_mi=28A0143B59C5B25C971E93B8DA13700C~YAAQKG0+F1VlU8GRAQAA2hMG3BmdhAJ72Y4Sdv09gW8fxQmeet+T7zc3i9sQcsU6JU5sCkds5QthSag+Z4f1VdnGo4sXeydHI1ZnFtJQ6Gv8b/2Yvg2C30b0mWoEH+SIjr17u6S4qhJ9L06JuRps0tzh0vOCt8GtI/+XEMrSiursWQZSp4qdfs/4g6O3S9lBcmDunp9A7VOJHvdW674y/jh7UKbKJD94XVcnJXSizNTE3wmSoMQPOMzHUJOpVcjNgdV4LA/a8hc81PCIPe8T21bjbqTJs7/q3m7NzAAfIVlk6oMfaBOifHH0DoUrppxjlJfdrGYZmHqB596GQvalhebV43Fa6NM6tEQt/Y575VUTigyv9eu+/FIv+cyjsA==~1; ak_bmsc=C018E3F69FC6832CE4E6599A1F82CD13~000000000000000000000000000000~YAAQKG0+F4hmU8GRAQAAjCoG3BlJXgH3qcZCgSqF0RlHgroeOHjnYvmLkpE7HmtbCe7JnBN0panxneIu5U6uBhh2EY7V0v/DpFudS0feOZuUK1cvn50PKwQH39fFsbWluN/n2F44rtVrG6zFJi+utTOdQq8b1voPYvqZxloiccdbFHkymXk/kHemU9Ec0WyuEWWPt5LIEMFe72cgPnGzONrY/TIJBoxbp8sPvsOTdvRLK+LBv+uBxWZkvn6TnnqeMz1Hk8GuOguw+tdz8d+o0xOxZU5SpCGWINH3wYw3yPjSKKDUHVjdEaQrYtCqwJqdZxdM3stjGcKWtZC0HfnBnCJpgSEE0DG4Uxfn+Uh0v8pTKTAfl1a3kD4GjE9sakopbPF2nHB7JmQ0WPvdnSH7Wh74LagFsVMOyw+armOeuDGNpAGy36GU/F5BuNnHVUi2rSeFyqnz1+w4kOrgFR2kYvbyS7Bz80i4EMN9y+oaWD+potpq+KlVJQ2CG7GyFcF7Pattf4tV0iNInYufFmgNKhaj+8/rry1k8eoZEHzz; _hjSession_966278=eyJpZCI6IjRkMzFhZDZhLWQ2MTMtNGJkZS05YmIyLTZmZGY5NmM1NzI5ZSIsImMiOjE3MjU5NzcwMjM1NDMsInMiOjEsInIiOjAsInNiIjowLCJzciI6MCwic2UiOjAsImZzIjowLCJzcCI6MH0=; cto_bundle=xOfoyV84V0Z2cUdNRGVneW81TWd2SW9WeHYlMkJ5M0VHR3Jwb0swdlpOVXdldU1EcWpYdWk5RUxvT25UNWxQVUhFTTJubFFQVzNNY2tsMm9kNEdzcWJ3YUdza3FNc0hycG1SRjdRSXczUEtqU3BvUnBCMndJdkhXRXAwc25Oc0w4TGQ1OTJ3TG0lMkJpbjUlMkJvUUhINGpmS1M4N0paalElM0QlM0Q; bm_sv=761DFB6AEFD54AC2F3EDC3654A4370BD~YAAQj1gDFzyBKteRAQAAxGlg3BkNrtspsbtfrrVTIkBWz6pOeAkd22V2kIzBtgwEUmoo6HuusVAQ3SUbuSvEmY6QawwTno5q86SOp8gUQdMZHqueQW1lyBRcEGn5I7rWdkJx3NYVtNhYYedKhkrJJySgcFOr4zQQcpDSL5280nguYNWZfHhDQENLW/XnN53vyIrFA/8bLH0t0cdTG92wdIvVAPlK0KhPWFekeWrquXvqP6YQzKwdcNzKNzW+38Eyj5jm~1; bm_sz=67ACE33281C12B9FC276BB84D27A0A4C~YAAQj1gDFz2BKteRAQAAxGlg3BmNBLFv5IjXGq9AeTQgQTN+BBbQa2XiPW6i4KHrbSbCSy+MG1MgY4oaOQ6iN4dHf7rnUUX3MFjXisitGJQW2DyZv+6n0p0wrVYe3sMjKUJElnYFYyv3Fq7jVG4BLRTJEh68gnqP3lXfx3MOi0seA1D9VcFC/2cOu1DwGgFyqQcjSHOOk315uoF9/ZLPQKBk0Es9jXSnSNsXf5lcQH7NXTcb/gM7gdcB8tZsL9dShw6C6EQEtAFKwVCDgG8bZo5n/yDqd5a8yekRSwrex521t4Irbx1yp4MPQhBv3gvE6vKBhhAxxxW2F/RFaokhlJW7IuljRFh8u/a7OxnDdvNXI/wMXToq9mR8zCnU82HXE9fLP3pHkyKZH+cRxdw3zSSMG8ZvFkFQPV9lTw567cm/WSTW7DfpCiK3ZdwoTvabzCeTZJMEW5Y7Mbjt9GAIBuDeRRa78sz90c4ndGgUxIxdtOyy63DkhOktVfZo6VUOARZ8c1V8asuTEZNZmIagiUKFuGHBlVmd5rKqg1MHaHVTa1nDrYEHJW2o4wA7TCCuZV5J~3360048~4404791; _ga_K1C5QQH2W0=GS1.1.1725977019.7.1.1725979196.0.0.0; _ga=GA1.1.293742513.1725340064; _abck=94588479B31B5F599AA8C0D4B56279A1~0~YAAQj1gDF1qBKteRAQAA0npg3AxMY2H8DyoYdBwsU9zJLxERa1tyofXX3MYKLPdXF0QsCkV/j1ViTqd/7QxFF4EMOsnlj3osfSzyxDwjssvE9yhdPOkaZ7K+i3dSQwsnzLe3+2D3xOK/t3WasKR/zBdNmw4CUPalMGDmGO3DuY2xgGXDYjuScjxfa1rrSaddQqrV+MOjazA4RP0Hyy5C/JrT9XBp8Mf8/DZYNuScIDd1WGPFmYfkKkE9k0nWUAmyRb7sjUXAbEvpUbpbCg7lOsbDwXv8ZeZ77MEAsX+9sGu+aLwWwbqmB84vr6KqwU6zmiypQC0j2IBeC8J9N4J8cUMW2dNL7d7tUuIXsOg3YE77TsUtBUEzvg8fU36ViTVkyPk8wG/NWUXUIg6IkNa42QwcSpDrEnXu9i/xZyTXuJ47XQ==~-1~-1~1725979622; TEAL=v:6191b64827b266317072053810995588f841a875960$t:1725980996607$sn:5$en:7$s:1725977025701%3Bexp-sess; _uetsid=028920306f6211ef8d92fdfe334af023; _uetvid=760a9bb069b211efa620ab1a1591a076; nol_fpid=sjyeqvpvwlhsdypijkux813volmwx1725340066|1725340066717|1725979198648|1725979199164; __gads=ID=0667a70fea75e472:T=1725340066:RT=1725979199:S=ALNI_MYaAzDU91ZIRUCGl1nKeeN0cMvEVw; __gpi=UID=00000eeac27cca24:T=1725340066:RT=1725979199:S=ALNI_MbOi2KWUCjlZplTdAXpjUphPQBuWQ; __eoi=ID=9a9ce344827a1a17:T=1725340066:RT=1725979199:S=AA-AfjZ59n41bIfjHv5w_SfaEmXW; _clsk=wbwy8q%7C1725979199885%7C10%7C0%7Cx.clarity.ms%2Fcollect; _ga_HFSVJ1Z577=GS1.1.1725977019.7.1.1725979225.26.0.0",
        "pragma": "no-cache",
        "referer": "https://www.domain.com.au/rent/?state=act&page=2",
        "sec-ch-ua": "\"Chromium\";v=\"9\", \"Not?A_Brand\";v=\"8\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"Windows\"",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36 SLBrowser/9.0.3.5211 SLBChan/10"
    }


    for z in range(0,10000,50):
        page = 1
        while True:
            params = {
                "state": "act",
                "page": f"{page}",
                "price": f"{z}-{z + 50}",
            }
            print(params)
            res = pool.Get(url=url,headers=headers,params=params)
            dom = res.json()
            # u = []
            Pool = ThreadPoolExecutor(10)
            items = list(dom['props']['listingsMap'].values())
            if not items:
                break
            for x in items:
                s = x.get('listingModel')['url']
                # u.append()
                # GetDetail(u)
                Pool.submit(GetDetail,f"https://www.domain.com.au{s}")
            Pool.shutdown()
            page+=1

# GetDetail function
# Fetches detailed data from the individual property listing page.
# Extracts information such as address, price, bedrooms, bathrooms, parking, and property features.
# Parses additional details like nearby schools using XPath and JSON parsing techniques.
# The parsed data is passed to the save function.
def GetDetail(url):
    # url = 'https://www.domain.com.au/80-stuart-street-narrabundah-act-2604-17202458'
    headers = {
        "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
        "accept-encoding": "gzip, deflate, br",
        "accept-language": "zh-CN,zh;q=0.9",
        "cache-control": "no-cache",
        # "cookie": "_gcl_au=1.1.1662210340.1725340064; domain-mixpanel-id_ab0bde70050c3eabaaf8824402fa01e0=$device:191b648213911c7-0b34d4f40607a1-2003037d-144000-191b648213911c7; _hjSessionUser_966278=eyJpZCI6IjU3YTFlN2NhLTJkYTctNTRlOC1hZmZiLWI5YjcyMjU4YmVkZiIsImNyZWF0ZWQiOjE3MjUzNDAwNjY0MTgsImV4aXN0aW5nIjp0cnVlfQ==; DM_SitId1455=1; DM_SitId1455SecId12673=1; DEVICE_SESSIONID=7d75026e-6e27-4660-a498-7fd14ddd8cf8; NUID=28a72632beef44daa4baac768218a9b4; DM_SitId1455SecId12671=1; _pbjs_userid_consent_data=3524755945110770; _gid=GA1.3.1999125749.1725965218; _abck=94588479B31B5F599AA8C0D4B56279A1~0~YAAQydfOF0zMK7+RAQAA/jOL2wzi+vsiz19AbFpgdxMf6mmqPJwGHvn6GZSq43BX64FR0Iu57F/FLy657jsbYR9P0GtoYtsVl7dV9Q0M/1/xteqs8qskT3+hLTB6hK+XvZvC49YC90JnLMM1dW/yq8U9xBJGSfLgzXj/WL+wuiM4CwhLsmKMnyFriBaK7zKPdUlQf9MJTmBdluEQf7A9CGRCQwTb8wr+04Z8i0kt6s8HyWSPgQ3LckVyuZ4lCI3x4aG+UVWiozzRfO9VWxnCB3YyQhTcG+ompHE9BNQ7gKx8LaH6ZXVZRYmFaPvK7eYe4k8Tx713VWpD17yCxpCSF51L4Q98EnzduVZbxoxTtMv2eJ+Wd1tz7YrZcLNp/nyH0z6Sd0YH2b8afXQ3iF06xLXPo2hvFs/kdlcY~-1~-1~1725968818; _hjSession_966278=eyJpZCI6IjdlOWZkZDllLTE0NDctNDc5Yi05OWY1LTc0ZjJhNzliMDRhYiIsImMiOjE3MjU5NjUyMjAyNjYsInMiOjEsInIiOjAsInNiIjowLCJzciI6MCwic2UiOjAsImZzIjowLCJzcCI6MH0=; searchSOI=act; bm_mi=B5EC6845F13FFAA51E206711702B7313~YAAQydfOF3EwLL+RAQAAX0SP2xk6oj2l7bMbF+TBB2WM5gnxrLYj8x5dne8IfE6HEWNt2gXTa3yJaz9Lh9x8iviRcK9sPxgiIRovLUnTC/jJyAfAYb8OEFAo+0fcVB+jmfhvR8n1rWH+nWtHOAitcxg9s+8k0VhWmLZPTFAwR/CF94PFmwtaysNNfXS6orCtsy1rjo7+pBkVK/NhD4Jo8nHxG1KewDeTBZXybVF07Lgd9Mszh7o8uGoCug9NYCiLFHQYo1NfzJVpxn0iepfSEiv3ebjBnzVb59YRYd3M25mRX07AvZKFkgZI/iSH3mXMC2OP6lM=~1; ak_bmsc=04AA3FED493941E050AF13976375B536~000000000000000000000000000000~YAAQydfOF88xLL+RAQAAfFSP2xnJIGjoD2Rmu1aMdHucXD19NuhrUlySpT1u7nFIONvJpDf3pR4Q8VnOd5MHINvMZTTTN7yxzbwiLIyxGF1W7tUbLacGtIvmBsvUiurAzkg09F3xL42oidw6AE5CCEbz/7IESvrifwYGsjE0vw8CBTXrx5c8Q1XtAHx+vBKKZGBFg0ggFu7XSVn0GUwKniummZIWKRGyhCErPi4e7gRg5uH9vMRwNoKsd+gkg07hKA7jCKqFdlfCN8phKagUQDPhm0IwAb3exz2lkkmIJZpg9Af/L+yV3TBEM1fdbZRTyvQ0m7HgDD/qqdLbCsJ2ka3ythaWWCiDbRkAJIHtV7g72oabUeEat0Z92Mkykn1Obn8HB+y6EBygRZ8B0QBXd6rs+yNoHd79nte43mXlFCrhUZz5j39TIUnBoRyv63EjEumm5spBZgXqUJdSL3Yjez4ZAKd5qSNcBXSv7aB/+Z/MAwEOhA==; _lr_geo_location=CN; _clck=1k78z9j%7C2%7Cfp2%7C0%7C1707; _clsk=zx2lxb%7C1725965490549%7C1%7C0%7Cx.clarity.ms%2Fcollect; bm_sz=16F90566431B0EE9230E0789D4D19D9F~YAAQydfOFzU2LL+RAQAA84CP2xmD34TpT/a+FE02edqKOfUKIw3Voa/5X5dPDVmBCrV5u4x8aWTHP/KHYULBopnlpz6Zj4Lvcxjf6LmK7XhGGIB4NwiHwMA0diXVAUwrxoeknB/oO/yqG41UWgvGnT6m681cMk0EStv969bwjLzX4ERRWHNklygTuVzIeabWccwU06+SQ9YMKz2hvLK9ml5Xq8RNbrSv4MC8lUPhay9gqeIIW+Xwtf5gLLzyT/Uu2C5aaVi4M6sF3fZLLq4Ddl08MeQG9TXrCN98lrlC4U6JuHfdKOgFtLKxlzhKmzOHzCSn4SiV3L2H58gBxeugsvegJUpNP1ZM8P214m9N/HT52OtRHkQpP6IQTcSqSoWQDu1bW9X6WU7niHxZq5bQzSi/K3xwrtpQEol9jPaw30xJ2Z6rXCmWqYjzKDjwjw==~4339250~3422008; _ga=GA1.1.293742513.1725340064; _uetsid=028920306f6211ef8d92fdfe334af023; _uetvid=760a9bb069b211efa620ab1a1591a076; nol_fpid=sjyeqvpvwlhsdypijkux813volmwx1725340066|1725340066717|1725965502615|1725965502752; cto_bundle=tl2wRl84V0Z2cUdNRGVneW81TWd2SW9WeHY3SmRscyUyRjQwT2hPNlM3bG1IV01tdlZTJTJGbCUyQiUyQnY0bkdFWnI3SlVBb2FhNllIVVRDbU9Fa1UwYTRDckZHZHNJSlI3MmxWWUZJejd2WUswWmF4NldhJTJCdk1MV2U4MFJETDdtWWc0UDZEaGtzaFd1MTQ4Qk5rVzlrRkRsNkNqck9HMzRBJTNEJTNE; __gads=ID=0667a70fea75e472:T=1725340066:RT=1725965538:S=ALNI_MYaAzDU91ZIRUCGl1nKeeN0cMvEVw; __gpi=UID=00000eeac27cca24:T=1725340066:RT=1725965538:S=ALNI_MbOi2KWUCjlZplTdAXpjUphPQBuWQ; __eoi=ID=9a9ce344827a1a17:T=1725340066:RT=1725965538:S=AA-AfjZ59n41bIfjHv5w_SfaEmXW; bm_sv=688FD556077925A468146285B8E0B268~YAAQydfOFwhrLL+RAQAAtU2R2xli3Sml8m3m+yZJVoH5rqMCRLTiH4JjsdSY0VOhbiaXehGAsHFv1IAvp7C34zdnQizYgVH0dxIKXzPCIXxmWi+clyIJslE+JFQ1hxsEQ+VAVbnnNkEyZvDsOdFH0fKFI7JmMd7WDg0rQ/Y7eTuupPPDFPCJuqs/0VHoQ/hcp0bTgYnAu5xXHh29EagYVZghywHhEguhKd7paygQnb4WAquhHfaGb0akToxeu+PPm/5S~1; TEAL=v:6191b64827b266317072053810995588f841a875960$t:1725967418854$sn:3$en:4$s:1725965221168%3Bexp-sess; _ga_K1C5QQH2W0=GS1.1.1725965218.5.1.1725965618.0.0.0; _ga_HFSVJ1Z577=GS1.1.1725965220.5.1.1725965618.59.0.0",
        "pragma": "no-cache",
        "referer": "https://www.domain.com.au/sale/?excludeunderoffer=1&state=act",
        "sec-ch-ua": "\"Chromium\";v=\"9\", \"Not?A_Brand\";v=\"8\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"Windows\"",
        "sec-fetch-dest": "document",
        "sec-fetch-mode": "navigate",
        "sec-fetch-site": "same-origin",
        "sec-fetch-user": "?1",
        "upgrade-insecure-requests": "1",
        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36 SLBrowser/9.0.3.5211 SLBChan/10"
    }

    res = pool.Get(url=url,headers=headers)
    s = re.findall('var digitalData = {([\s\S]*?)};',res.text)
    # print(s)
    dom = json.loads('{'+s[0]+'}')
    property = dom['page']['pageInfo']['property']
    address = property.get('address')
    price = property.get('price')
    bedrooms = property.get('bedrooms')
    bathrooms = property.get('bathrooms')
    parking = property.get('parking')
    try:
        Property_Features = property.get('structuredFeatures')[0]['name'] if property.get('structuredFeatures') else ''
    except Exception as e:
        Property_Features = ''
    _ = {
        "address":address,
        "price":price,
        "bedrooms":bedrooms,
        "bathrooms":bathrooms,
        "parking":parking,
        "Property_Features":Property_Features,
    }
    dom = etree.HTML(res.text)
    txt = dom.xpath('//*[@id="__NEXT_DATA__"]/text()')[0]
    txt = txt.strip()
    dom2 = json.loads(txt)
    try:
        xx_ = dom2['props']['pageProps']['componentProps']['schoolCatchment']['schools']
    except Exception as e:
        xx_ = []
    d = []
    for x in xx_:
        x.get('name')
        x.get('distance')
        d.append(f"{x.get('name')}    {x.get('distance')}")

    _.update({
        'sahool':'\n'.join(d)
    })

    save(_)
from loguru import logger
import os
import pandas as pd
from concurrent.futures import ThreadPoolExecutor
count = 0
rootfile = '数据.csv'

# save function
# Saves the collected data into a CSV file (数据.csv). If the file already exists, it appends the data without headers.
# Converts the CSV to an Excel file after completing the data collection.
def save(_):
    global count
    count += 1
    logger.debug(f"当前爬取完成：{count}，{_}")
    df = pd.DataFrame([list(_.values())])
    if os.path.exists(rootfile):
        df.to_csv(rootfile, index=False, mode='a', header=None, encoding='utf-8-sig', sep='；')
    else:
        df.to_csv(rootfile, index=False, mode='a', header=list(_.keys()), encoding='utf-8-sig', sep='；')


import json
import re
from lxml import etree
if __name__ == '__main__':
    GetList()

    if os.path.exists(rootfile):
        df = pd.read_csv(rootfile,sep='；')
        df.to_excel(rootfile.replace('.csv','.xlsx'),index=False)
    pass