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
  let result = [];

  arr.map(elementArr => {
    let element = elementArr;
    if((element === 'bom')||(element ==='positivo')) element = 1;
    else element = 0;
    result.push(element);
  });
  return result;
}

const toClass = (arr) => {
  let output = arr[0];

  if(output <= 0) output = 'negativo';
  else output = 'positivo';
  return output;
}

const execute = () =>{
  let execution =[];
  let selectInput = $('#selectInput').val().toString().trim();

  if(selectInput.length > 0) {
    $('#result').html('...Carregando.');
    execution = arrayStringToNumber([selectInput]);

    const model = tf.sequential();
    const inputLayer = tf.layers.dense({units: 1, inputShape: [1]});
    model.add(inputLayer);
    model.compile({loss: 'meanSquaredError', optimizer: 'sgd'});

    const x = tf.tensor(arrayStringToNumber(inputs), [inputs.length, 1]);
    const y = tf.tensor(arrayStringToNumber(classes), [classes.length, 1]);
    const input = tf.tensor(execution, [1, 1]);

    model.fit(x, y, {epochs: 500}).then(() => {
      let output = model.predict(input).abs().round().dataSync();
      output = toClass(output);
      $('#result').html(` - Classificação: <strong>${output}</strong>`)
    })
  }
}