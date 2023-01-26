import createModule from './intrinsicCalib';

export default function Intrinsic() {
  createModule().then((Module) => {
    checkerFunction = Module.cwrap('readCheckerboardParams', 'number');
    if (checkerFunction(checkerInputs.dx, checkerInputs.dy, checkerInputs.rows, checkerInputs.cols) !== 1) {
      console.log('fail to transfer param to WASM!');
    }
    console.log("wasm!!!")
  }


  return (
    <div>
      <h1>Intrinsic</h1>
    </div>
  );
}
