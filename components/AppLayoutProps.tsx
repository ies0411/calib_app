import React, { ReactNode, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { Router, useRouter } from 'next/router';
import css from 'styled-jsx/css';
import { AppstoreOutlined, MailOutlined, SettingOutlined } from '@ant-design/icons';
import type { MenuProps, MenuTheme } from 'antd';
import { Menu, Switch } from 'antd';
// import Intrinsic from './intrinsic';

const style = css`
  * {
    margin: 0;
    padding: 0;
  }

  #root > div {
    height: 100%;
    line-height: normal;
  }
  #header {
    height: 64px;
    display: flex;
    justify-content: center;
    border-bottom: 1px solid gray;

    /* position: fixed; */
  }

  #body {
    height: 800px;
    width: 90%;
    /* margin: 0 auto; */
    padding-bottom: 24px;
    display: flex;
  }
  #body > #main {
    padding-left: 10px;
    padding-top: 10px;
  }

  #footer {
    height: 150px;
    background-color: rgb(240, 240, 240);
    display: flex;
    justify-content: center;
    align-items: center;
  }
  #footer img {
    height: 100px;
    width: 100px;
  }

  #header-area {
    width: 90%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  #header-area img {
    width: 128px;
    height: 36px;
    cursor: pointer;
  }
`;
type MenuItem = Required<MenuProps>['items'][number];

function getItem(
  label: React.ReactNode,
  key?: React.Key | null,
  icon?: React.ReactNode,
  children?: MenuItem[],
  type?: 'group'
): MenuItem {
  return {
    key,
    icon,
    children,
    label,
    type,
  } as MenuItem;
}
const items: MenuItem[] = [
  getItem('cam-cam', 'sub1', <MailOutlined />, [
    getItem('intrinsic', '1'),
    getItem('stereo', '2'),
    getItem('fisheye', '3'),
  ]),

  getItem('cam-lidar', 'sub2', <AppstoreOutlined />, [
    getItem('targetbase', '5'),
    getItem('targetless', '6'),
    // getItem('Submenu', 'sub3', null, [getItem('Option 7', '7'), getItem('Option 8', '8')]),
  ]),

  getItem('cam-imu', 'sub4', <SettingOutlined />, [getItem('ext', '9')]),
];

type Props = {
  children?: ReactNode;
  // title?: string;
};
export default function AppLayout({ children }: Props) {
  const router = useRouter();
  const [theme, setTheme] = useState<MenuTheme>('dark');
  const [current, setCurrent] = useState('1');
  // const [page, setPage] = useState('/');
  const changeTheme = (value: boolean) => {
    setTheme(value ? 'dark' : 'light');
  };
  const onClick: MenuProps['onClick'] = (e) => {
    console.log('click ', e);
    setCurrent(e.key);
    switch (e.key) {
      case '1':
        console.log('set intrinsic');
        router.push('/intrinsic');
      case '2':
        console.log('set stereo');
        router.push('/stereo');
      case '3':
        console.log('set fisheye');
        router.push('/fisheye');

      case '5':
        console.log('set ext cam & lidar');
        router.push('/ext_camlidar');
      case '6':
        console.log('set ext');
        router.push('/ext_targetless');
      case '9':
        console.log('set imu & cam');
        router.push('/ext_camIMU');
        break;

      default:
        break;
    }
  };
  return (
    <>
      <div id="header">
        <div id="header-area">
          {/* <Link href={'/'}> */}
          <img
            src="image/logo_superbai_color.png"
            onClick={() => {
              router.push('/');
            }}
            alt="logo"
          />
          {/* </Link> */}
        </div>
      </div>
      <div id="body">
        <div id="menu">
          <Switch checked={theme === 'dark'} onChange={changeTheme} checkedChildren="Dark" unCheckedChildren="Light" />
          <br />
          <br />
          <Menu
            theme={theme}
            onClick={onClick}
            style={{ width: 256 }}
            defaultOpenKeys={['sub1']}
            selectedKeys={[current]}
            mode="inline"
            items={items}
          />
        </div>
        <div id="main">{children}</div>
      </div>
      <div id="footer">footer</div>
      <style jsx>{style}</style>
    </>
  );
}

// export default function Home() {

//   return (

//     // <>

//     // </>
//   );
// }
