import './index.css';

import 'antd/dist/antd.min.css';
import React, { useState } from 'react';
import { UploadOutlined } from '@ant-design/icons';
import { Button, message, Upload, Input } from 'antd';

import createModule from './extrinsicCalib';

/* Input component
  intrinsic, filter, checkerboard size
*/

//TODO :free memory

export function ExtrinsicInputParam() {
  //value
  let pcdArray = [];
  let imgArray = [];
  let imgTypeArray = [];
  let doublenByte = 8;
  const [intrinsicInputs, setIntrinsicInputs] = useState({
    width: null,
    height: null,
    K1: null,
    K2: null,
    P1: null,
    P2: null,
    P3: null,
    Fx: null,
    Fy: null,
    Cx: null,
    Cy: null,
  });
  const [filterInputs, setFilterInputs] = useState({
    X_min: null,
    X_max: null,
    Y_min: null,
    Y_max: null,
    Z_min: null,
    Z_max: null,
  });
  const [checkerInputs, setCheckerInputs] = useState({
    dx: null,
    dy: null,
    rows: null,
    cols: null,
  });

  const intrinsicEntry = Object.entries(intrinsicInputs);
  const filterEntry = Object.entries(filterInputs);
  const checkerEntry = Object.entries(checkerInputs);
  //solve
  const solve = (e) => {
    e.preventDefault();
    for (const [, value] of intrinsicEntry) {
      if (value === null) {
        alert('fill intrinsic');
        return;
      }
    }
    for (const [, value] of checkerEntry) {
      if (value === null) {
        alert('fill checker');
        return;
      }
    }
    for (const [, value] of filterEntry) {
      if (value === null) {
        alert('fill fillter');
        return;
      }
    }

    if (imgArray.length === 0) {
      alert('insert Image!');
    }
    if (pcdArray.length === 0) {
      alert('insert PCD!');
    }
    createModule().then((Module) => {
      const intrinsicArr = Object.values(intrinsicInputs);
      const intrinsicPtr = Module._malloc(intrinsicArr.length * doublenByte);
      Module.HEAPF64.set(intrinsicArr, intrinsicPtr / doublenByte);
      console.log('intrinsic : ' + Module._readCameraParams(intrinsicPtr));

      const filterArr = Object.values(filterEntry);
      const filterPtr = Module._malloc(filterArr.length * doublenByte);
      Module.HEAPF64.set(filterArr, filterPtr / doublenByte);
      console.log('filterResult : ' + Module._readCheckerPosition(filterPtr));
      console.log('filterResult : ' + Module._readCheckerPosition(filterPtr));
      console.log(
        'checkerResult : ' +
          Module._readCheckerboardParams(checkerInputs.dx, checkerInputs.dy, checkerInputs.rows, checkerInputs.cols)
      );

      pcdArray.forEach((pcdData, index) => {
        const fileName = `/pcd${index}.pcd`;
        console.log('js pcd :' + fileName);
        Module.FS.writeFile(fileName, pcdData);
        let readPCD = () => null;
        readPCD = Module.cwrap('readPCD', 'number', ['string']);
        readPCD(fileName);
      });

      for (let i = 0; i < imgArray.length; i++) {
        if (imgTypeArray[i] === null) {
          alert('upload png or jpg file!');
          return;
        }
        const fileName = `/eximg${i}.${imgTypeArray[i]}`;
        console.log('js img : ' + fileName);
        Module.FS.writeFile(fileName, imgArray[i]);
        let readImg = () => null;
        readImg = Module.cwrap('readImg', 'number', ['string']);
        readImg(fileName);
      }
      let results = Module._malloc(doublenByte * 12);
      // Module.FS.loadFile
      // (fileName, imgArray[i]);
      Module._solveCalib(results);
      //TODO: sort pcd img file, match number of files

      Module._free(intrinsicPtr);
      Module._free(filterPtr);
    });
  };

  const onIntrinsicChange = (e) => {
    console.log(e.target.value);
    const { value, name } = e.target;
    setIntrinsicInputs({
      ...intrinsicInputs,
      [name]: value,
    });
  };
  const onFilterChange = (e) => {
    console.log(e.target.value);
    const { value, name } = e.target;
    setFilterInputs({
      ...filterInputs,
      [name]: value,
    });
  };
  const onCheckerChange = (e) => {
    console.log(e.target.value);
    const { value, name } = e.target;
    setCheckerInputs({
      ...checkerInputs,
      [name]: value,
    });
  };

  const pcd_props = {
    accept: '.pcd',
    multiple: true,
    showUploadList: false,
    beforeUpload: (file) => {
      const reader = new FileReader();

      reader.readAsText(file);
      reader.onload = () => {
        pcdArray.push(reader.result);
      };
    },
  };
  const img_props = {
    // accept: '.jpg' || '.png',
    multiple: true,
    showUploadList: false,
    beforeUpload: (file) => {
      const fileType =
        file.name.lastIndexOf('.png') !== -1 ? 'png' : console.log(file.name.lastIndexOf('.jpg')) !== -1 ? 'jpg' : null;

      const reader = new FileReader();
      reader.readAsArrayBuffer(file);

      reader.onload = (event) => {
        const uint8ArrData = new Uint8Array(event.target.result);
        imgArray.push(uint8ArrData);
        imgTypeArray.push(fileType);
      };
    },
  };

  return (
    <div>
      <div id="upload">
        <div id="pcd">
          <Upload {...pcd_props}>
            <Button icon={<UploadOutlined />}>PCD Upload</Button>
          </Upload>
        </div>
        <div id="img">
          <Upload {...img_props}>
            <Button icon={<UploadOutlined />}>Image Upload</Button>
          </Upload>
        </div>
      </div>
      <div id="param">
        <div id="intrinsic">
          <h3>Intrinsic</h3>
          {intrinsicEntry.map(([key, value]) => (
            <Input
              size="small"
              style={{ width: '20%' }}
              name={key}
              placeholder={key}
              onChange={onIntrinsicChange}
              value={value}
            />
          ))}
        </div>

        <div id="filter">
          <h3>Filter</h3>

          {filterEntry.map(([key, value]) => (
            <Input
              size="small"
              style={{ width: '20%' }}
              name={key}
              placeholder={key}
              onChange={onFilterChange}
              value={value}
            />
          ))}
        </div>

        <div id="checker">
          <h3>CheckerBoard Info</h3>

          {checkerEntry.map(([key, value]) => (
            <Input
              size="small"
              style={{ width: '20%' }}
              name={key}
              placeholder={key}
              onChange={onCheckerChange}
              value={value}
            />
          ))}
        </div>
      </div>
      <div id="solve">
        <Button onClick={solve}>solve</Button>
      </div>
    </div>
  );
}
