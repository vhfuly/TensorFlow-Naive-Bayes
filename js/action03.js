// Navies Bayes linguagem natural
let inputs = [];
let classes = [];
let loaded = '';
let fileName = '';

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

	data = data.replace(/\r\n\r\n/g, '');
	let lines = data.split('\r\n');

	lines.map(line => {
		//tokenização do texto
		let tokens = line.split(' ');
		tokens.map(token => {
			inputs.push(token.toString().trim());
			classes.push(className);
		})
	})
	loaded += 'Carregado o arquivo: ' + className + '<br>';
	$('#loaded').html(loaded);
	prepareRegistration();
}

const prepareRegistration = () => {
	$('#input').val('');
	$('#class').val('0');
}

const execute = () =>{
	$('#class').html('...')

	let input = $('#input').val().toString().trim();
	let tokenizationInput = input.split(' ');

	let nameClasses = returnsClasses();
	let probability = [];

	tokenizationInput.map(token => {
		let naive = naiveBayes(token);

		nameClasses.map(nameClass =>{
			let percentage = parseFloat(naive[nameClass] * 100).toFixed(2);
			if (percentage >= 50) probability.push(nameClass)
		});
	});

	let classification = '';
	let repetition = 0;
	nameClasses.map(nameClass =>{
		let repeat = probability.filter(nameClassProbability => {
			return nameClassProbability === nameClass;
		}).length;

		if(repeat > repetition) {
			repetition = repeat;
			classification = nameClass;
		}
	});

	$('#class').html(classification)
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