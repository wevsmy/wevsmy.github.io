import json
import os
from urllib import request, parse


class BingWallpaper:
    """下载必应壁纸"""

    def __init__(self, filePath):
        self.filePath = filePath
        self.hosts = "http://cn.bing.com"
        self.imgDate = ""
        self.imgUrl = ""
        self.imgFileName = ""
        self.jsonDataPath = os.path.join(filePath, "BingWallpaperInfo.json")
        self.bingWallpaperInfo = {}
        self.__get_BingWallpaperInfo()

    def __get_json_data(self, idx=0):
        # idx = 0是今天的，-1明天，1昨天
        json_url = self.hosts + "/HPImageArchive.aspx?format=js&n=1&idx={}".format(idx)
        try:
            data = request.urlopen(json_url).read().decode("utf-8")
            json_data = json.loads(data)
            return json_data
        except Exception as e:
            print("get_json_data:", e)

    def __get_BingWallpaperInfo(self):
        if not os.path.exists(self.jsonDataPath):
            try:
                with open(self.jsonDataPath, mode="w") as f:
                    json.dump(self.bingWallpaperInfo, f)
            except Exception as e:
                print("get_BingWallpaperInfo:", e)
        else:
            try:
                with open(self.jsonDataPath) as f:
                    self.bingWallpaperInfo = json.load(f)
            except Exception as e:
                print("get_BingWallpaperInfo:", e)

    def __save_BingWallpaperInfo(self):
        try:
            with open(self.jsonDataPath, mode="w") as f:
                json.dump(self.bingWallpaperInfo, f)
                print("{} save_json!".format(self.jsonDataPath))
        except Exception as e:
            print("save_BingWallpaperInfo:", e)

    def __get_img_info(self, idx=0):
        try:
            json_data = self.__get_json_data(idx)
            self.imgDate = json_data["images"][0]["enddate"]
            self.imgUrl = self.hosts + json_data["images"][0]["url"]
            result = parse.urlparse(self.imgUrl)
            ret = parse.parse_qs(result.query)
            fileName = ret["id"][0]
            self.imgFileName = self.imgDate + "_" + fileName
        except Exception as e:
            print("get_img_info:", e)

    def __down_img(self):
        with request.urlopen(self.imgUrl) as f:
            data = f.read()
            self.path = os.path.join(self.filePath, self.imgFileName)
            with open(self.path, mode="wb") as f1:
                f1.write(data)

    def save_img(self, idx=0):
        self.__get_img_info(idx)
        self.__down_img()
        print("{} download!".format(self.path))

    def save_json(self, idx=0):
        d: dict = self.__get_json_data(idx)
        try:
            image: dict
            images: list = d.get("images")
            for image in images:
                startdate = image.get("startdate")
                self.bingWallpaperInfo.setdefault(startdate, image)
        except Exception as e:
            print("save_json:", e)
        self.__save_BingWallpaperInfo()


if __name__ == '__main__':
    filepath, fullflname = os.path.split(__file__)
    print("path:", filepath)
    print("run...")
    wall = BingWallpaper(filepath)
    for i in range(7):
        wall.save_json(i)
        print("end!", i)
    # exit = input("please enter any key to exit...")
