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
	let labels = returnsClasses();
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