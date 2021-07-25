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

const eliminateDuplicates = (arr) => {
	arr = [...new Set(arr)];
	return arr;
}


const arrayStringToNumber = (arr) => {

}

const toClass = (arr) => {

}

const execute = () =>{

}