let inputs = ['bom', 'mau', 'indiferente', 'indiferente'];
let classes = ['positivo', 'negativo','positivo', 'negativo'];

const prepareRegistration = () => {
	$('#input').val('');
	$('#class').val('');
}

const register = () => {
	inputs.push($('#input').val().toString().trim());
	classes.push($('#class').val().toString().trim());

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

	for(let i = 0; i < nameInputs.length; i++) {
		options = `<option value=${nameInputs[i]}>${nameInputs[i]}</option>`;
	}

	$('#rows').html(rows);
	$('#selectInput').html(options);
}

const execute = () =>{
	let selectInput = $('#selectInput').val();
	let probability = '';

	let nameClasses = returnsClasses();
	
	if (selectInput.toString().trim().length > 0 ) {
		let naive = naiveBayes(selectInput);

		
		for(let i = 0; i < nameClasses.length; i++) {
			let percentage = parseFloat(naive[nameClasses[i]] * 100).toFixed(2)
			probability += `<strong> ${nameClasses[i]}: </strong> ${percentage} % - `;
		}
		probability = `: ${probability} #`;
		probability = probability.replace(' - #', '');
	} else {
		probability = ': 0';
	}
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
	console.log(str)
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
		
		for(let j=0; j< labels.length; j++) {
			params[labels[j]] = countText(object[labels[j]], inputs[i]);
		}
		categories[i] = JSON.stringify(params);
	}

	categories = eliminateDuplicates(categories);

	for (let i=0; i < categories.length; i++) {
		categories[i] = JSON.parse(categories[i])
	}
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
	let nameClass = returnsClasses();
	let strClasses = JSON.stringify(classes);

	for (let i=0; i < nameClass.length; i++) {
		totalClass[nameClass[i]] = countText(strClasses, nameClass[i]);
	}

	return totalClass;
}