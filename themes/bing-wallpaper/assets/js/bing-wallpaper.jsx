/*
 * @Author: wilson.wu
 * @Date: 2023-02-07 13:07:29
 * @LastEditors: wilson.wu
 * @LastEditTime: 2023-02-08 15:37:46
 * @FilePath: \blog_source\themes\bing-wallpaper\assets\js\bing-wallpaper.jsx
 * @Description:
 * Contact: wevsmy@gamil.com
 *
 * Copyright (c) 2023 by wilson.wu, All Rights Reserved.
 */

// Note: We're using the CDN in "production".
import React from "react";
import { createRoot } from "react-dom/client";
import axios from "axios";

let BingWallpaperInfoUri = "./BingWallpaperInfo.json";
if (process.env.NODE_ENV === "development") {
  BingWallpaperInfoUri = "./BingWallpaperInfo.json";
}

// 全屏壁纸
class FullScreenWallpaper extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    // return <div>123{this.props.url}</div>;
    return (
      <div className="FullScreenWallpaper">
        <img className="picture" src="https://bing.com/th?id=OHR.SantoriniAerial_JA-JP9943637372_1920x1080.jpg&rf=LaDigue_1920x1080.jpg&pid=hp"></img>
      </div>
    );
  }
}

// A simple React JSX component.
class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      // liked: false,
      loading: true,
      bingWallpaperInfo: {},
    };
  }

  // 组件已经被渲染到 DOM 中后运行
  componentDidMount() {
    axios
      .get(BingWallpaperInfoUri)
      .then((res) => {
        if (res.status === 200) {
          this.setState({
            bingWallpaperInfo: res.data,
          });
        }
        // console.log(res.data);
        console.log("1234");
      })
      .catch((err) => {
        console.error(err);
      })
      .then(() => {
        this.setState({
          loading: false,
        });
      });
  }
  componentWillUnmount() {}

  render() {
    if (this.state.loading) {
      return "s!";
    }

    // if (this.state.liked) {
    //   return "You liked this!";
    // }

    // return <button onClick={() => this.setState({ liked: true })}>Like</button>;
    return <FullScreenWallpaper url="123asa" />;
  }
}

// 为提供的创建一个 React 根container并返回根。
const root = createRoot(document.getElementById("bing-wallpaper"));
// 根可用于将 React 元素渲染到 DOM 中
root.render(<App />);
