/*
 * @Author: wilson.wu
 * @Date: 2023-02-07 13:07:29
 * @LastEditors: wilson.wu
 * @LastEditTime: 2023-02-07 14:25:23
 * @FilePath: \blog_source\themes\bingWallpaper\assets\js\bingWallpaper.jsx
 * @Description:
 * Contact: wevsmy@gamil.com
 *
 * Copyright (c) 2023 by wilson.wu, All Rights Reserved.
 */
// Note: We're using the CDN in "production".
import React from "react";
import { createRoot } from "react-dom/client";

// A simple React JSX component.
class LikeButton extends React.Component {
    constructor(props) {
      super(props);
      this.state = { liked: false };
    }

    render() {
      if (this.state.liked) {
        return 'You liked this!';
      }

      return (
        <button onClick={() => this.setState({ liked: true }) }>
          Like
        </button>
      );
    }
  }

// 为提供的创建一个 React 根container并返回根。
const root = createRoot(document.getElementById("bingWallpaper"));
// 根可用于将 React 元素渲染到 DOM 中
root.render(<LikeButton />);
