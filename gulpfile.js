const Fs = require('fs');
const Path = require('path');
const Gulp = require('gulp');
const Handlebars = require('gulp-compile-handlebars');
const Rename = require('gulp-rename');
const Inquirer = require('inquirer');

const questions = [
    {
        type: 'input',
        name: 'input',
        message: 'Enter your input directory.',
        default: Path.join(__dirname, '/input')
    },
    {
        type: 'list',
        name: 'template',
        message: 'Select your TEMPLATE HTML to generate.',
        choices: function(answer) {
            return getFilesFiltered(answer.input, 'html');
        }
    },
    {
        type: 'list',
        name: 'data',
        message: 'Select your JSON DATA to associate with your template.',
        choices: function(answer) {
            return getFilesFiltered(answer.input, 'json');
        }
    },
    {
        type: 'list',
        name: 'key',
        message: 'Select your JSON KEY to name the generated files.',
        choices: function(answer) {
            var json = require(Path.join(answer.input, answer.data));
            if (!Array.isArray(json)) {
                json = [json];
            }
            answer.json = json;
            return Object.keys(json[0]);
        }
    },
    {
        type: 'output',
        name: 'output',
        message: 'Enter your output directory.',
        default: Path.join(__dirname, '/output')
    },
];

function getFilesFiltered(dir, ext) {
    return Fs.readdirSync(dir)
        .filter(file => {
            if (file.indexOf('.' + ext) != -1) {
                return file;
            }
        })
}

function compile() {
    Inquirer.prompt(questions).then(answers => {
        answers.json.forEach(item => {
            Gulp.src(Path.join(answers.input, answers.template))
                .pipe(Handlebars(item))
                .pipe(Rename({basename: item[answers.key]}))
                .pipe(Gulp.dest(answers.output));
        });
    });
}

Gulp.task('default', compile);