import { ExtrinsicInputParam } from './extrinsic';
import { IntrinsicInputParam } from './intrinsic';

import { AppstoreOutlined } from '@ant-design/icons';
import 'antd/dist/antd.min.css';
import { Menu } from 'antd';
import React from 'react';
import { Route, Routes, Link } from 'react-router-dom';

import './App.css';
// label: <Link to="/">홈</Link>,
function getItem(label, key, icon, children, type) {
  return {
    key,
    icon,
    children,
    label,
    type,
  };
}
const items = [
  getItem('Extrinsic Calib', 'sub1', <AppstoreOutlined />, [
    getItem(<Link to="/extrinsic_stereo">stereo</Link>, 'e1'),
    getItem(<Link to="/extrinsic_camlidar">camera-lidar</Link>, 'e2'),
  ]),
  getItem('Intrinsic', 'sub2', <AppstoreOutlined />, [getItem(<Link to="/intrinsic_cam">camera</Link>, 'i1')]),
];

function App() {
  return (
    <div>
      <div id="header">
        <div id="header-area">
          <Link to={'/'}>
            <img src="image/logo_superbai_color.png" alt="logo" />
          </Link>
        </div>
      </div>
      <div id="body">
        <div id="menu">
          <Menu
            style={{
              width: 256,
            }}
            defaultSelectedKeys={['e1']}
            defaultOpenKeys={['sub1']}
            mode="inline"
            items={items}
          />
        </div>
        <div id="main">
          <Routes>
            <Route path="/extrinsic_camlidar" exact={true} element={<ExtrinsicInputParam />} />
            <Route path="/intrinsic_cam" exact={true} element={<IntrinsicInputParam />} />
          </Routes>
        </div>
      </div>
      <div id="footer">
        <img src="image/logo.png" alt="logo" />
      </div>
    </div>
  );
}

export default App;
