let preprocessor = 'scss'; // Определяем переменную "preprocessor", выбор препроцессора в проекте - sass, scss или less
const { src, dest, parallel, series, watch } = require('gulp'); // Определяем константы Gulp
const browserSync = require('browser-sync').create(); // Подключаем Browsersync
const concat = require('gulp-concat'); // Подключаем gulp-concat
const uglify = require('gulp-uglify-es').default; // Подключаем gulp-uglify-es
const scss = require('gulp-sass')(require('sass')); // Подключаем модули gulp-sass и gulp-less
const autoprefixer = require('gulp-autoprefixer'); // Подключаем Autoprefixer
const cleancss = require('gulp-clean-css'); // Подключаем модуль gulp-clean-css
const imagecomp = require('compress-images'); // Подключаем compress-images для работы с изображениями
const del = require('del'); // Подключаем модуль del

// Определяем логику работы Browsersync
function browsersync() {
	browserSync.init({ // Инициализация Browsersync
		server: { baseDir: 'app/' }, // Указываем папку сервера
		notify: false, // Отключаем уведомления
		online: true // Режим работы: true или false
	})
}

// Работа со скриптами
function scripts() {
	return src('app/scripts/script.js') // Пользовательские скрипты, использующие библиотеку, должны быть подключены в конце
		.pipe(concat('app.min.js')) // Конкатенируем в один файл
		// .pipe(uglify()) // Сжимаем JavaScript
		.pipe(dest('app/scripts/')) // Выгружаем готовый файл в папку назначения
		.pipe(browserSync.stream()) // Триггерим Browsersync для обновления страницы
}

//Работа со стилями
function styles() {
	return src('app/' + preprocessor + '/style.' + preprocessor + '') // Выбираем источник: "app/sass/main.sass" или "app/less/main.less"
		.pipe(eval(preprocessor)()) // Преобразуем значение переменной "preprocessor" в функцию
		.pipe(concat('app.min.css')) // Конкатенируем в файл app.min.css
		.pipe(autoprefixer({ overrideBrowserslist: ['last 10 versions'], grid: true })) // Создадим префиксы с помощью Autoprefixer
		.pipe(cleancss({ level: { 1: { specialComments: 0 } }, format: 'beautify' })) // Минифицируем стили
		.pipe(dest('app/css/')) // Выгрузим результат в папку "app/css/"
		.pipe(browserSync.stream()) // Сделаем инъекцию в браузер
}

//Работа с изображениями
async function images() {
	imagecomp(
		"app/images/src/**/*", // Берём все изображения из папки источника
		"app/images/dest/", // Выгружаем оптимизированные изображения в папку назначения
		{ compress_force: false, statistic: true, autoupdate: true }, false, // Настраиваем основные параметры
		{ jpg: { engine: "mozjpeg", command: ["-quality", "75"] } }, // Сжимаем и оптимизируем изображеня
		{ png: { engine: "pngquant", command: ["--quality=75-100", "-o"] } },
		{ svg: { engine: "svgo", command: "--multipass" } },
		{ gif: { engine: "gifsicle", command: ["--colors", "64", "--use-col=web"] } },
		function (err, completed) { // Обновляем страницу по завершению
			if (completed === true) {
				browserSync.reload()
			}
		}
	)
}

//Очистка папки с изображениями
function cleanimg() {
	return del('app/images/dest/**/*', { force: true }) // Удаляем все содержимое папки "app/images/dest/"
}

//Создание сборки
function buildcopy() {
	return src([ // Выбираем нужные файлы
		'app/css/**/*.min.css',
		'app/scripts/**/*.min.js',
		'app/images/dest/**/*',
		'app/fonts/**/*',
		'app/**/*.html',
	], { base: 'app' }) // Параметр "base" сохраняет структуру проекта при копировании
		.pipe(dest('dist')) // Выгружаем в папку с финальной сборкой
}

//Очистка сборки
function cleandist() {
	return del('dist/**/*', { force: true }) // Удаляем все содержимое папки "dist/"
}

//Проверка изменений
function startwatch() {
	watch(['app/**/*.js', '!app/**/*.min.js'], scripts); // Выбираем все файлы JS в проекте, а затем исключим с суффиксом .min.js
	watch('app/**/' + preprocessor + '/**/*', styles); // Мониторим файлы препроцессора на изменения
	watch('app/**/*.html').on('change', browserSync.reload); // Мониторим файлы HTML на изменения
	watch('app/images/src/**/*', images); // Мониторим папку-источник изображений и выполняем images(), если есть изменения
}

exports.browsersync = browsersync; // Экспортируем функцию browsersync() как таск browsersync. Значение после знака = это имеющаяся функция.
exports.scripts = scripts; // Экспортируем функцию scripts() в таск scripts
exports.styles = styles; // Экспортируем функцию styles() в таск styles
exports.images = images; // Экспорт функции images() в таск images
exports.cleanimg = cleanimg; // Экспортируем функцию cleanimg() как таск cleanimg
exports.build = series(cleandist, styles, scripts, images, buildcopy); // Создаем новый таск "build", который последовательно выполняет нужные операции
exports.default = parallel(styles, scripts, browsersync, startwatch); // Экспортируем дефолтный таск с нужным набором функций
