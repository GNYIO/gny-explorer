
const fs = require('fs');

const packageRaw = fs.readFileSync('./package.json', {
    encoding: 'utf-8'
})
const package = JSON.parse(packageRaw);


const arg = process.argv[2];

const regex = new RegExp(/^v[0-9]+\.[0-9]+\.[0-9]$/);

if (!regex.test(arg)) {
    console.error("the provided versio is not valid. It doesn't fit the RegExp");
    process.exit(1);
}

package.version = arg;

const target = JSON.stringify(package, null, 2);

fs.writeFileSync('./package.json', target, {
    encoding: 'utf-8',
});

