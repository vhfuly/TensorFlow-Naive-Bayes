﻿// Navies Bayes classificativo
let inputs = [];
let classes = [];

let leitorDeCSV = new FileReader();

window.onload = function init() {
	leitorDeCSV.onload = openFile;
}

function catchCSV(inputFile) {
	let file = inputFile.files[0];
 	leitorDeCSV.readAsText(file);
}


const openFile = (event) => {
	let file = event.target.result;
	file = file.trim()
	load(file);
}

const load = (data) => {
	let character = ',';
	if(data.indexOf(';') >= 0) character = ';';
	let lines = data.split('\r\n');
	for(let i=1; i<lines.length; i++) {
		let cells = lines[i].split(character);
		inputs.push(cells[0]);
		classes.push(cells[1]);
	}	
  register();
}

const save = () => {
	let txt = 'input;output\r\n';
	for(let i=0; i<inputs.length; i++) {
		txt += inputs[i]+';'+classes[i]+'\r\n';
	}
	txt += '#';
	txt = txt.replace(/\r\n#/g, '');
	let filename = 'model';
	let blob = new Blob([txt], {type: 'text/plain;charset=utf-8'});
	saveAs(blob, filename + '.csv');
}

const prepareRegistration = () => {
	$('#input').val('');
	$('#class').val('');
}

const register = () => {
	if($('#input').val().toString().trim().length > 0) {
		inputs.push($('#input').val().toString().trim());
		classes.push($('#class').val().toString().trim());
	}
	let rows = '';

	for(let i = 0; i < inputs.length; i++) {
		rows += `
		<tr>
			<td> ${inputs[i]} </td>
			<td> ${classes[i]} </td>
		</tr>
		`
	}

	let options = '<option value=""></option>';
	let nameInputs = eliminateDuplicates(inputs);

	nameInputs.map(nameInput => {
		options += `<option value=${nameInput}>${nameInput}</option>`;
	})

	$('#rows').html(rows);
	$('#selectInput').html(options);
}

const execute = () =>{
	let selectInput = $('#selectInput').val();
	let probability = '';

	let nameClasses = returnsClasses();
	
	if (selectInput.toString().trim().length > 0 ) {
		let naive = naiveBayes(selectInput);

		let highestPercentage = 0;
		let classPercentage = '';

		nameClasses.map(nameClass => {
			let percentage = parseFloat(naive[nameClass] * 100).toFixed(2)
			if (percentage >= highestPercentage) {
				highestPercentage = percentage;
				classPercentage = nameClass;
			}
		})
		probability = ` - CLASSIFICAÇÃO: <strong>${classPercentage}</strong>`;
	} else {
		probability = ': 0';
	}
	
	$('#result').html(probability)
}

const returnsClasses = () => {
	let arr = classes;
	arr = eliminateDuplicates(arr);
	return arr;
}

const eliminateDuplicates = (arr) => {
	arr = [...new Set(arr)];
	return arr;
}

const organize = () => {
	let params = {};

	for (let i=0; i < inputs.length; i++) {
		let character = '';
		if(i<(inputs.length-1)) character = '-';

		if(params[classes[i]]) {
			params[classes[i]] += inputs[i] + character;
		} else {
			params[classes[i]] = inputs[i] + character;
		}
	}
	let str = JSON.stringify(params);
	str = str.replace(/-"/g, '"');
	str = str.replace(/-/g, ',');

	params = JSON.parse(str);

	return params;
}

const countText = (text, search) => {
	return text.split(search).length-1;
}

const frequency = () => {
	let categories = [];
	let params = {};
	let object = organize();
	let labels = returnsClasses();

	for (let i=0; i < inputs.length; i++) {
		params.input = inputs[i];
		
		labels.map(label => {
			return params[label] = countText(object[label], inputs[i]);
		})
		
		categories[i] = JSON.stringify(params);
	}

	categories = eliminateDuplicates(categories);

	categories = categories.map(category => {
		return category = JSON.parse(category)
	})
	
	return categories;
}

const numberOfClasses = () => {
	let categories = frequency();
	return parseInt(Object.keys(categories[0]).length-1);
}

const sumOfClasses = (arr) => {
	let sum = 0;
	for (let i=1; i < arr.length; i++) {
		sum += parseInt(arr[i]);
	}
	return sum;
}

const totalPerClass = () => {
	let totalClass = [];
	let nameClasses = returnsClasses();
	let strClasses = JSON.stringify(classes);

	nameClasses.map(nameClass => {
		totalClass[nameClass] = countText(strClasses, nameClass);
	});

	return totalClass;
}

const totalSumsClasses =  () => {
	return classes.length;
}

const weightsInputs = () => {
	let weights = [];
	let categories = frequency();

	categories.map(category => {
		weights[category.input] = sumOfClasses(Object.values(category)) / totalSumsClasses();
	})

	return weights;
}

const weightsClasses = () => {
	let nameClasses = returnsClasses();
	let totalClasses = totalPerClass();
	let weights = [];

	nameClasses.map(nameClass => {
		weights[nameClass] = totalClasses[nameClass] / totalSumsClasses();
	});

	return weights;
}

const inputClassOccurrence = (_input = '', _class= '') => {
	let categories = frequency();
	let occurrence = 0;

	categories.forEach(category => {
		if (category['input'] === _input) {
			occurrence = parseInt(category[_class]);
		}
	});
	return occurrence;
}

const naiveBayes = (_input = '') => {
	let nameClasses = returnsClasses();
	let totalClass = totalPerClass();

	let categories = frequency();
	let sum = 0;

	categories.forEach(category => {
		if(category['input'] === _input) {
			nameClasses.forEach(nameClass => {
				sum += parseInt(category[nameClass]);
			})
		}
	});

	sum = tf.scalar(sum);

	let sumClass = tf.scalar(totalSumsClasses());
	let probability = [];
	
	nameClasses.forEach(nameClass => {
		let occurrence = tf.scalar(inputClassOccurrence(_input, nameClass));
		let totalC = tf.scalar(totalClass[nameClass]);

		probability[nameClass] =
		  occurrence.div(totalC).mul(totalC.div(sumClass)).div(sum.div(sumClass)).dataSync();
	})
  return probability;
}