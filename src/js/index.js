import '../css/index.css';
import '../css/index2.less';
import '../css/index3.styl';
import '../css/iconfont.css';
import print from './print';

console.log('index.js文件++++');
// 开启非入口js文件的热更新,由你自己引入其他js文件
if (module.hot) {
  module.hot.accept('./print.js', () => {
    print();
  });
}
