import './index.css';

import 'antd/dist/antd.min.css';
import React, { useEffect, useState } from 'react';
import { UploadOutlined } from '@ant-design/icons';
import { Button, message, Upload, Input, Typography } from 'antd';
// import { Button, message, Upload, Checkbox, Form, Input } from 'antd';

import createModule from './intrinsicCalib';

/* Input component
  intrinsic, filter, checkerboard size
*/
//TODO :free memory
const { Title, Text } = Typography;

export function IntrinsicInputParam() {
  let imgTypeArray = [];
  let imgArray = [];
  let showImage = [];
  let imgFileArr = [];
  const [imageSrc, setImageSrc] = useState('');
  const [resultValues, setResultValues] = useState({
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
  const [checkerInputs, setCheckerInputs] = useState({
    dx: null,
    dy: null,
    rows: null,
    cols: null,
  });

  const checkerEntry = Object.entries(checkerInputs);
  const resultsEntry = Object.entries(resultValues);

  const solve = (e) => {
    e.preventDefault();

    for (const [, value] of checkerEntry) {
      if (value === null) {
        alert('fill checker param');
        return;
      }
    }

    if (imgFileArr.length === 0) {
      alert('insert Image!');
    }
    const sortFileArr = imgFileArr.sort((a, b) => {
      return a.name - b.name;
    });
    console.log(sortFileArr);
    let checkerFunction = () => null;
    let solveCalib = () => null;
    //MEMO : tranfer checkerboard info to WASM Module
    createModule().then((Module) => {
      checkerFunction = Module.cwrap('readCheckerboardParams', 'number');
      if (checkerFunction(checkerInputs.dx, checkerInputs.dy, checkerInputs.rows, checkerInputs.cols) !== 1) {
        message('fail to transfer param to WASM!');
      }

      for (let i = 0; i < sortFileArr.length; i++) {
        const fileType =
          sortFileArr[i].name.lastIndexOf('.png') !== -1
            ? 'png'
            : sortFileArr[i].name.lastIndexOf('.jpg') !== -1
            ? 'jpg'
            : null;

        if (fileType === null) {
          alert('upload png or jpg file!');
          return;
        }

        const reader = new FileReader();
        reader.readAsArrayBuffer(sortFileArr[i]);
        const uint8ArrData = new Uint8Array(reader.result);

        const fileName = `/inimg${i}.${fileType}`;
        console.log('js img : ' + fileName);
        Module.FS.writeFile(fileName, uint8ArrData);
        let readImg = () => null;
        readImg = Module.cwrap('readImg', 'number', ['string']);
        readImg(fileName);
        console.log('check');
        if (-1 === Module._preSolveCalib(i)) {
          console.log('detecting fail');
          let debug_img = [];
          debug_img = Module.FS.readFile(fileName);
          console.log(debug_img);
        }
      }
      const doublenType = 8;
      console.log('calib sovle');
      let results = Module._malloc(doublenType * 9);
      let R = Module._malloc(doublenType * imgArray.length * 3);
      let T = Module._malloc(doublenType * imgArray.length * 3);
      solveCalib = Module.cwrap('solveCalib', 'number');
      solveCalib(results, R, T);
      let results_value = new Float64Array(Module.HEAPF64.buffer, results, 9);
      let results_R = new Float64Array(Module.HEAPF64.buffer, R, imgArray.length * 3);
      let results_T = new Float64Array(Module.HEAPF64.buffer, T, imgArray.length * 3);

      console.log(results_value);
      console.log(results_R);
      console.log(results_T);

      setResultValues({
        ...resultValues,
        ['K1']: results_value[0],
        ['K2']: results_value[1],
        ['P1']: results_value[2],
        ['P2']: results_value[3],
        ['P3']: results_value[4],
        ['Fx']: results_value[5],
        ['Cx']: results_value[6],
        ['Fy']: results_value[7],
        ['Cy']: results_value[8],
      });

      Module._free(results);
      Module._free(R);
      Module._free(T);
    });
  };
  const onCheckerChange = (e) => {
    const { value, name } = e.target;
    setCheckerInputs({
      ...checkerInputs,
      [name]: value,
    });
  };

  const img_props = {
    // accept: '.png' || 'jpg',
    multiple: true,
    showUploadList: false,

    beforeUpload: async (file) => {
      imgFileArr.push(file);
    },
  };

  return (
    <div>
      <div id="upload">
        <div id="img">
          <Upload {...img_props}>
            <Button icon={<UploadOutlined />}>Image Upload</Button>
          </Upload>
        </div>
      </div>
      <div id="param">
        <div id="checker">
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
      <div id="preview">
        {<img src={imageSrc} alt="preview-img" />}
        <div id="result">
          <Title id="title" level={2}>
            Result
          </Title>
          {resultsEntry.map(([key, value]) => (
            <Text className="intrinsic" type="default">
              {key}: {value}
            </Text>
          ))}
        </div>
      </div>
    </div>
  );
}
