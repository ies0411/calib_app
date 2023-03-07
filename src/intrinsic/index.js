import './index.css';

import 'antd/dist/antd.min.css';
import React, { useEffect, useState } from 'react';
import { UploadOutlined } from '@ant-design/icons';
import { Button, message, Upload, Input, Typography } from 'antd';
import createModule from './intrinsicCalib';
/* Input component
  intrinsic, filter, checkerboard size
*/
//TODO :free memory
const { Title, Text } = Typography;

export function IntrinsicInputParam() {
  // src = new cv.Mat(128, 64, cv.CV_8UC4);
  let imgArray = [];
  let showImage = [];
  let imgInfoArr = [];
  const doublenType = 8;
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

    if (imgInfoArr.length === 0) {
      alert('insert Image!');
    }
    const sortFileArr = imgInfoArr.sort((a, b) => {
      if (a.name < b.name) {
        return -1;
      } else if (a.name > b.name) {
        return 1;
      } else {
        return 0;
      }
    });

    let checkerFunction = () => null;
    let solveCalib = () => null;
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

        const fileName = `/inimg${i}.${fileType}`;

        console.log('js img : ' + fileName);
        Module.FS.writeFile(fileName, sortFileArr[i].data);

        let readImg = () => null;
        readImg = Module.cwrap('readImage', 'number', ['string']);
        readImg(fileName);
        let res_ptr = Module._malloc(4 * 2);

        let getImageResolution = () => null;

        getImageResolution = Module.cwrap('getImageResolution', 'number', ['string', 'number']);
        getImageResolution(fileName, res_ptr);
        // var output_array = new Int32Array(Module.HEAP32.buffer, output_ptr, len)
        let [width, height] = new Int32Array(Module.HEAP32.buffer, res_ptr, 2);

        console.log('wid : ' + width);
        console.log('hei :' + height);

        let preSolveCalib = () => null;
        preSolveCalib = Module.cwrap('preSolveCalib', 'number', ['string']);
        if (-1 === preSolveCalib(fileName)) {
          console.log('detecting fail');
          // let debug_img = [];
          // debug_img = Module.FS.readFile(fileName);
          // console.log(debug_img);
          // }
        }
      }

      console.log('calib sovle');
      let results = Module._malloc(doublenType * 9);
      let R = Module._malloc(doublenType * 3);
      let T = Module._malloc(doublenType * 3);
      let error = Module._malloc(doublenType * 1);

      solveCalib = Module.cwrap('solveCalib', 'number');
      solveCalib(results);
      let results_value = new Float64Array(Module.HEAPF64.buffer, results, 9);
      // let results_R = new Float64Array(Module.HEAPF64.buffer, R, imgArray.length * 3);
      // let results_T = new Float64Array(Module.HEAPF64.buffer, T, imgArray.length * 3);
      //debug
      let fileName = '.in01.jpg';

      let getCalibResult = () => null;
      getCalibResult = Module.cwrap('getCalibResult', 'number', ['string', 'number', 'number', 'number']);
      getCalibResult(fileName, R, T, error);
      let results_R = new Float64Array(Module.HEAPF64.buffer, R, 3);
      let results_T = new Float64Array(Module.HEAPF64.buffer, T, 3);
      let results_error = new Float64Array(Module.HEAPF64.buffer, error, 1);

      // int EMSCRIPTEN_KEEPALIVE getCalibResult(char* file_name, double* R_result, double* T_result, double* error_value) {

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
      const reader = new FileReader();
      reader.readAsArrayBuffer(file);

      reader.onload = (event) => {
        // console.log(reader.result);
        const uint8ArrData = new Uint8Array(event.target.result);
        let tmpImgInfo = {};
        tmpImgInfo['name'] = file.name;
        tmpImgInfo['data'] = uint8ArrData;
        // console.log(uint8ArrData);
        imgInfoArr.push(tmpImgInfo);
      };
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
