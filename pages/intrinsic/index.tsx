import createModule from './intrinsicCalib';

export default function Intrinsic() {
  let checkerFunction = () => null;
  createModule().then((Module) => {
    console.log('wasm!!!');
    checkerFunction = Module.cwrap('readCheckerboardParams', 'number');
    if (checkerFunction(1, 2, 3, 4) !== 1) {
      console.log('fail to transfer param to WASM!');
    }
  });

  return (
    <div>
      <h1>Intrinsic</h1>
    </div>
  );
}
