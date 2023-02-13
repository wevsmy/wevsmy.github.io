/*
 * @Author: wilson.wu
 * @Date: 2023-02-07 13:07:29
 * @LastEditors: wilson.wu
 * @LastEditTime: 2023-02-13 15:59:25
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

  getPictureStyle() {
    const style = {
      backgroundImage: "url(" + this.props.host + this.props.data.url + ")",
    };
    return style;
  }

  render() {
    return (
      <div className="FullScreenWallpaper">
        <div className="picture" style={this.getPictureStyle()}>
          <div className="overlay">
            <div className="title">{this.props.data.title}</div>
            <div className="fullstartdate">{this.props.data.fullstartdate}</div>
            <div className="copyright">{this.props.data.copyright}</div>
          </div>
        </div>
      </div>
    );
  }
}

class WallpaperItem extends React.Component {
  constructor(props) {
    super(props);
  }

  getPictureStyle() {
    const style = {
      backgroundImage: "url(" + this.props.host + this.props.data.url + ")",
    };
    return style;
  }

  downloadImg_1920x1080(url) {
    const x = new XMLHttpRequest();
    x.open("GET", url, true);
    x.responseType = "blob";
    x.onload = function (e) {
      const uri = new URL(url);
      const href = window.URL.createObjectURL(x.response);
      const a = document.createElement("a");
      a.href = href;
      a.download = uri.searchParams.get("id");
      a.click();
    };
    x.send();
  }

  render() {
    return (
      <div className="WallpaperItem">
        <div className="lazyload picture" style={this.getPictureStyle()} data-src="/favicon.ico">
          <div className="overlay">
            <div className="title">{this.props.data.title}</div>
            <div className="fullstartdate">{this.props.data.fullstartdate}</div>
            <div className="copyright">{this.props.data.copyright}</div>
            <div
              className="download"
              onClick={() =>
                this.downloadImg_1920x1080(
                  this.props.host + this.props.data.url
                )
              }
            >
              1920x1080
            </div>
          </div>
        </div>
      </div>
    );
  }
}

class WallpaperGrid extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const data = this.props.pagination.data;
    const listItems = data.map((d) => (
      <WallpaperItem key={d.startdate} host={this.props.host} data={d} />
    ));
    return (
      <div className="WallpaperGrid">
        <div id="gridbox" className="gridbox">
          {listItems}
        </div>
      </div>
    );
  }
}

class Pagination extends React.Component {
  constructor(props) {
    super(props);
    this.handlePrevClick = this.handlePrevClick.bind(this);
    this.handleNextClick = this.handleNextClick.bind(this);
    this.state = {
      defaultCurrent: 1,
      defaultPageSize: 9,
      total: 0,
      disabledPrev: false,
      disabledNext: false,
    };
  }

  componentDidMount() {
    this.setState({
      defaultPageSize: this.props.pageSize || this.state.defaultPageSize,
    });
    this.handleDisabled();
  }

  handleDisabled() {
    if (this.props.current <= 1) {
      this.setState({
        disabledPrev: true,
      });
    } else {
      this.setState({
        disabledPrev: false,
      });
    }
  }

  handlePrevClick() {
    console.log("handlePrevClick");
    this.handleDisabled();
    const current = this.props.current - 1;
    this.props.onChange(current, this.state.defaultPageSize);
  }

  handleNextClick() {
    console.log("handleNextClick");
    this.handleDisabled();
    const current = this.props.current + 1;
    this.props.onChange(current, this.state.defaultPageSize);
  }

  render() {
    return (
      <div className="Pagination">
        <button
          className="prev"
          onClick={this.handlePrevClick}
          disabled={this.state.disabledPrev}
        >
          上一页
        </button>
        <button
          className="next"
          onClick={this.handleNextClick}
          disabled={this.state.disabledNext}
        >
          下一页
        </button>
      </div>
    );
  }
}

// A simple React JSX component.
class App extends React.Component {
  constructor(props) {
    super(props);
    this.onChange = this.onChange.bind(this);
    this.state = {
      host: "https://bing.com",
      loading: true,
      current: 1,
      pageSize: 9,
      bingWallpaperKeys: [],
      bingWallpaperInfo: {},
    };
  }

  // 组件已经被渲染到 DOM 中后运行
  componentDidMount() {
    this.onloadData();
    window.addEventListener("resize", this.onWindowResize);
  }
  componentWillUnmount() {
    window.removeEventListener("resize", this.onWindowResize);
  }

  onloadData() {
    axios
      .get(BingWallpaperInfoUri)
      .then((res) => {
        if (res.status === 200) {
          this.setState({
            bingWallpaperInfo: res.data,
            bingWallpaperKeys: Object.keys(res.data),
          });
        }
      })
      .catch((err) => {
        this.setState({
          loading: true,
        });
        console.error(err);
      })
      .then(() => {
        this.setState({
          loading: false,
        });
      });
  }

  onWindowResize(e) {
    window.scrollTo(0, 0);
  }

  getWallpaperKeys() {
    const keys = this.state.bingWallpaperKeys;
    return keys;
  }

  getWallpaperTotal() {
    const total = this.getWallpaperKeys().length;
    return total;
  }

  getWallpaperPagination(current, pageSize) {
    const dataAllKeys = this.getWallpaperKeys();
    const total = dataAllKeys.length;
    let offset = total - current * pageSize;
    if (current * pageSize > total) {
      offset = total - (current - 1) * pageSize;
    }
    const dataKeys = dataAllKeys.slice(offset, offset + pageSize);
    const data = dataKeys.map((x) => {
      return this.state.bingWallpaperInfo[x];
    });
    return {
      current,
      pageSize,
      total,
      data,
    };
  }

  getLatestWallpaper() {
    const latestWallpaper =
      this.state.bingWallpaperInfo[this.getWallpaperKeys().slice(-1)[0]];
    return latestWallpaper;
  }

  onChange(page, pageSize) {
    // prev
    if (this.state.current > page) {
    }
    // next
    if (this.state.current < page) {
    }
    this.setState({
      current: page,
    });
  }

  render() {
    if (this.state.loading) {
      return "s!";
    }
    // return <button onClick={() => this.setState({ liked: true })}>Like</button>;
    return (
      <div className="bing-container">
        <FullScreenWallpaper
          host={this.state.host}
          data={this.getLatestWallpaper()}
        />
        <WallpaperGrid
          host={this.state.host}
          pagination={this.getWallpaperPagination(
            this.state.current,
            this.state.pageSize
          )}
        />
        <Pagination
          onChange={this.onChange}
          current={this.state.current}
          pageSize={this.state.pageSize}
          total={this.getWallpaperTotal()}
        />
      </div>
    );
  }
}

// 为提供的创建一个 React 根container并返回根。
const root = createRoot(document.getElementById("bing-wallpaper"));
// 根可用于将 React 元素渲染到 DOM 中
root.render(<App />);
