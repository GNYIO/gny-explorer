import Vue from 'vue';
import ElementUI from 'element-ui';
// import 'element-theme-chalk';
import 'element-ui/lib/theme-chalk/index.css';
import locale from 'element-ui/lib/locale/lang/en';

Vue.use(ElementUI, { locale });

Vue.filter('truncate', function (text, stop, clamp) {
    if (text === null || text === undefined || text === '') {
      return '';
    }
    return text.slice(0, stop) + (stop < text.length ? clamp || '...' : '')
});
