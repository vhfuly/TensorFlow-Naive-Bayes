// Navies Bayes linguagem natural
let inputs = [];
let classes = [];
let loaded = '';
let fileName = '';

let classesIndex = 0;
let objClasses = [];

let leitorDeCSV = new FileReader();

window.onload = function init() {
	leitorDeCSV.onload = openFile;
}

function catchCSV(inputFile) {
	let file = inputFile.files[0];
	fileName = file.name;
	leitorDeCSV.readAsText(file);
}


const openFile = (event) => {
	let file = event.target.result;
	console.log('test',fileName)
	file = file.trim()
	load(file, fileName);
}

const load = (data, name) => {
	let className = name.substr(0, name.indexOf('.')).toString().trim();
	objClasses.push({class: className, index: classesIndex})

	data = data.replace(/\r\n\r\n/g, '');
	let lines = data.split('\r\n');

	lines.map(line => {
		//tokenização do texto
		let tokens = line.split(' ');
		inputs.push(arrayStringToNumber(tokens));
		classes.push([classesIndex]);
	})
	loaded += 'Carregado o arquivo: ' + className + '<br>';
	$('#loaded').html(loaded);
	prepareRegistration();
	classesIndex++;
}

const prepareRegistration = () => {
	$('#input').val('');
	$('#class').val('0');
}


const eliminateDuplicates = (arr) => {
	arr = [...new Set(arr)];
	return arr;
}

const arrayStringToNumber = (arr) => {
  let result = [];
	let qtd = 0;
	let sum = 0;

  arr.map(elementArr => {
    let element = elementArr;
    if(element.length > 0) {
			element = element.map(char => char.charCodeAt(0))
				.reduce((current, previous) => previous + current);
			sum += Math.sqrt(element);
			qtd++;
		} else {
			sum +=0;
		}
	});
	
	let mean = parseFloat(sum/qtd).toFixed(0);
	result.push(Number(mean));
	return result;
}

const toClass = (arr) => {
	let result = '';
	let output = arr[0];
	
  objClasses.map(objClass => {
    if(objClass.index === output) result = objClass.class;
	});
  return result;
}

const execute = () =>{

}
