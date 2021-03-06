'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

/////////////////////////////////////////////////
// Data

// DIFFERENT DATA! Contains movement dates, currency and locale

const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2020-05-08T14:11:59.604Z',
    '2020-05-27T17:01:17.194Z',
    '2020-07-11T23:36:17.929Z',
    '2020-07-12T10:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2020-04-10T14:43:26.374Z',
    '2020-06-25T18:49:59.371Z',
    '2020-07-26T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];

/////////////////////////////////////////////////
// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

/////////////////////////////////////////////////
// Functions

let countDown;

const options = {
  //hour: 'numeric', // n???u mu???n xu???t hi???n th?? b??? comment ??i
  //minute: 'numeric', // n???u mu???n xu???t hi???n th?? b??? comment ??i
  day: 'numeric',
  //month: 'long', // t??y ng??n ng??? m???i hi???n c??? th??ng
  month: 'numeric',
  year: 'numeric',
  //weekday: 'long',
};

const now = new Date();

const changeDateTime = function(lang, target) {
  return Intl.DateTimeFormat(lang,options).format(target);  
}

// function changeDate via the number of day passed and the locale
const changeDate = function(n,locale){
  const devideDate = (day1, day2) => Math.abs(new Date(day1 - day2) / (1000*60*60*24));
  const div = devideDate(new Date(), new Date(n));
  if(div <= 1) return 'today'
  if(div > 1 && div <= 2) return 'yesterday'
  if(div <= 7 && div > 2) return `${Math.trunc(div)} days`
  return Intl.DateTimeFormat(locale,options).format(new Date(n));
}


// display the list of movements with or without sort
const displayMovements = function (acc, sort = false) {
  containerMovements.innerHTML = '';

  const movs = sort ? acc.movements.slice().sort((a, b) => a - b) : acc.movements;

  movs.forEach(function (mov, i) {
    const type = mov > 0 ? 'deposit' : 'withdrawal';
    
    const html = `
      <div class="movements__row">
        <div class="movements__type movements__type--${type}">${i + 1} ${type}</div>
        <div class="movements__date">${changeDate(acc.movementsDates[i],acc.locale)}</div>
        <div class="movements__value">${showFormattedCurrency(acc, mov)}</div> 
      </div>
    `;

    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

// show the formatted currency with the account's locale and currency
const showFormattedCurrency = function(acc, value) {
  return Intl.NumberFormat(acc.locale,{
    style: 'currency',
    currency: acc.currency,
  }).format(value);
}

// function print account's balance
const calcDisplayBalance = function (acc) {
  acc.balance = acc.movements.reduce((acc, mov) => acc + mov, 0);
  labelBalance.textContent = showFormattedCurrency(acc, acc.balance); ////////////
};

// function print all the summaries of the account (in, out, interest)
const calcDisplaySummary = function (acc) {
  const incomes = acc.movements
    .filter(mov => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumIn.textContent = showFormattedCurrency(acc, incomes);

  const out = acc.movements
    .filter(mov => mov < 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumOut.textContent = showFormattedCurrency(acc, Math.abs(out));

  const interest = acc.movements
    .filter(mov => mov > 0)
    .map(deposit => (deposit * acc.interestRate) / 100)
    .filter((int, i, arr) => {
      // console.log(arr);
      return int >= 1;
    })
    .reduce((acc, int) => acc + int, 0);
  labelSumInterest.textContent = showFormattedCurrency(acc, interest);
};


// function create username via name and surname
const createUsernames = function (accs) {
  accs.forEach(function (acc) {
    acc.username = acc.owner
      .toLowerCase()
      .split(' ')
      .map(name => name[0])
      .join('');
  });
};
createUsernames(accounts);

// function help update the ui after each change
const updateUI = function (acc) {
  // Display movements
  displayMovements(acc);

  // Display balance
  calcDisplayBalance(acc);

  // Display summary
  calcDisplaySummary(acc);
  // Start timer if there is no action
  startTimer(); // timer t??? l??m 
};

///////////////////////////////////////
// Event handlers


// innitialize the current account
let currentAccount;


// login event handler
btnLogin.addEventListener('click', function (e) {
  // Prevent form from submitting
  e.preventDefault();

  currentAccount = accounts.find(
    acc => acc.username === inputLoginUsername.value
  );
  console.log(currentAccount);

  if (currentAccount?.pin === +inputLoginPin.value) {
    // Display UI and message
    labelWelcome.textContent = `Welcome back, ${
      currentAccount.owner.split(' ')[0]
    }`;
    containerApp.style.opacity = 100;
    // Display date via account locale
    labelDate.textContent = changeDateTime(currentAccount.locale,now);
    //labelDate.textContent = Intl.DateTimeFormat('en-US',options).format(now);

    // Clear input fields
    inputLoginUsername.value = inputLoginPin.value = '';
    inputLoginPin.blur();

    // Update UI
    updateUI(currentAccount);
  }
});

// transfer event handler
btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();
  const amount = +inputTransferAmount.value;
  const receiverAcc = accounts.find(
    acc => acc.username === inputTransferTo.value
  );
  inputTransferAmount.value = inputTransferTo.value = '';

  if (
    amount > 0 &&
    receiverAcc &&
    currentAccount.balance >= amount &&
    receiverAcc?.username !== currentAccount.username
  ) {
    // Doing the transfer
    currentAccount.movements.push(-amount);
    currentAccount.movementsDates.push(new Date().toISOString())
    receiverAcc.movements.push(amount);
    receiverAcc.movementsDates.push(new Date().toISOString())

    // Update UI
    updateUI(currentAccount);
  }
});

// loan event handler
btnLoan.addEventListener('click', function (e) {
  e.preventDefault();

  const amount = +inputLoanAmount.value;

  if (amount > 0 && currentAccount.movements.some(mov => mov >= amount * 0.1)) {
    // Add movement
    currentAccount.movements.push(amount);
    currentAccount.movementsDates.push(new Date().toISOString())

    // Update UI
    updateUI(currentAccount);
  }
  inputLoanAmount.value = '';
});

// close account event handler
btnClose.addEventListener('click', function (e) {
  e.preventDefault();

  if (
    inputCloseUsername.value === currentAccount.username &&
    Number(inputClosePin.value) === currentAccount.pin
  ) {
    const index = accounts.findIndex(
      acc => acc.username === currentAccount.username
    );
    console.log(index);
    // .indexOf(23)

    // Delete account
    accounts.splice(index, 1);

    // Hide UI
    containerApp.style.opacity = 0;
  }

  inputCloseUsername.value = inputClosePin.value = '';
});

// initialize sort with false (no sort)
let sorted = false;

// sort event handler
btnSort.addEventListener('click', function (e) {
  e.preventDefault();
  displayMovements(currentAccount, !sorted);
  sorted = !sorted;
});

// timer t??? l??m 



const startTimer = function() {
  if (countDown) {
    clearInterval(countDown);
    labelTimer.textContent = '';
  }
  //Set timer at 5:00
  let start = 300;
  // ph???i t??ch interVal ra kh???i setInterval ????? startTimer ch???y ngay l???p t???c ko th?? s??? ph???i ch??? 1s !! tip
  const interVal = function() {
    const j = String(start%60).padStart(2, '0');
    const i = String(Math.floor(start/60)).padStart(2, '0');
    labelTimer.textContent = `${i}:${j}`;
    
    if(start === 0) {
      clearInterval(countDown);
      labelWelcome.textContent = 'Login to get started';
      containerApp.style.opacity = 0;
    };

    start--;
  }
  //count to zero
  interVal(); // ph???i ch???y ??? ????y tr?????c
  countDown = setInterval(interVal,1000);
  return countDown;
}


/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES
/*
console.log(23/0 === Infinity); // output: true

// check if value is number
console.log(Number.isFinite(22)); // output: true
console.log(Number.isFinite('22')); // output: false
console.log(Number.isFinite(+'22')); // output: true
console.log(Number.isFinite(+'22PX')); // output: false -> NaN

console.log(23 === 23.0); // output: true
console.log(0.1 + 0.2 === 0.3); // output: false
console.log(0.1 + 0.2); // output: 0.30000000000000004

console.log(Number('68')); //output : 68

console.log(+'68'); // output : 68  !!!!! thay cho Number()
// parsing: ch??? l???y g??a tr??? s???
console.log(Number.parseInt('68px')); // output: 68
console.log(Number.parseInt('  99rem ')); // output: 99
console.log(Number.parseInt('22px', 10)); // output : 22 //h??? 10
console.log(Number.parseInt('22px', 2)); // output: NaN // h??? 2 
console.log(Number.parseInt(1000, 2)); // output: 8 // h??? 2
console.log(Number.parseInt('  rem555   ')); // output: NaN
console.log(Number.parseFloat(' 5.5rem   ')); // output: 5.5

console.log(Number.isNaN('foo'/3)); // output:  true
console.log(Number.isNaN(undefined + undefined)); // output: true
console.log(Number.isNaN(Math.sqrt(-1))); // output:  true
console.log(Number.isNaN('e33')); // output: false
console.log(Number.isNaN(+'68PX')); // output: true



console.log(Math.sqrt(25));
console.log(25 ** (1/2));
console.log(8 ** (1/3));

console.log(Math.PI);
console.log(Math.PI * Math.sqrt(25) ** 2);
console.log(Math.PI * Number.parseFloat('10px') ** 2);

console.log(Math.max(3,5,7,92,34,22));
console.log(Math.max(3,5,7,'92',34,22));
console.log(Math.max(3,5,7,'92px',34,22));

console.log(Math.min(3,5,7,'92',34,22));

console.log(Math.trunc(Math.random()*10) + 1);

const randomInt = (min, max) => Math.floor(Math.random()*(max-min)+1) + min;//!!!!!!!!!
console.log(randomInt(-6,8)); // thay trunc b???ng floor

//rounding

console.log(Math.trunc(Math.round(68.4)));
console.log(Math.sign(-99)); // s??? ??m => -1
console.log(Math.sign(68)); // s??? d????ng => 1
console.log(Math.sign(0)); // 0 => 0

console.log(Math.floor('45.3')); // l??m tr??n xu???ng , gi???ng trunc
console.log(Math.floor(45.8)); // l??m tr??n xu???ng

console.log(Math.ceil(45.2)); // l??m tr??n l??n
console.log(Math.ceil('45.8')); // l??m tr??n l??n

console.log(Math.floor(-45.8));
console.log(Math.ceil(-45.8));
console.log(Math.trunc(-45.8));
// => floor thay th??? trunc t???t h??n trong b??i t??m min max

console.log(Math.fround(68.67));

console.log(Number(68.45.toFixed(0)));
console.log(68.45.toFixed(2)); // h??m toFixed() l???y gi?? tr??? sau d???u ph???y v?? t??? l??m tr??n
console.log(+68.45.toFixed(6)); // chuy???n t??? string ra number
console.log(68.45554.toFixed(2));

const isEven = x => x%2 === 0;
console.log(isEven(6));

labelBalance.addEventListener('click', function() {
  // PH???N N??Y PH???I N???M TRONG EVENT HANDLER , N???U N???M NGO??I S??? KH??NG CH???Y => V?? N?? ???????C EXECUTE NGAY KHI CODE CH???Y, N??N L??C ????NG NH???P S??? KH??NG CH???Y L???I N???A
  [...document.querySelectorAll('.movements__row')].forEach((mov, i, arr) => {
    if((i%2)===0){
      mov.style.backgroundColor = 'lightgrey';
    }
    if(i%3===0){
      mov.style.backgroundColor = 'grey';
    }
  });
})

//BIGINT

console.log(2**53 - 1);
console.log(Number.MAX_SAFE_INTEGER);
console.log(Number.MAX_VALUE);
console.log(Number.MIN_SAFE_INTEGER);
console.log(Number.MIN_VALUE);

console.log(900719925474099155555); // wrong
console.log(900719925474099155555n);
console.log(BigInt(900719925474099155555n)); // sai v?? js s??? in s??? n??y nh?? int r???i m???i chuy???n th??nh bigint, ch??? n??n d??ng v???i s??? nh???

// Operations

console.log(20000n + 30000n);
console.log(900719925474099155555n + 90071992547409915555588n);
//console.log(Math.sqrt(25n)); // not working 


console.log(90071992547409915555588n * 44322n);
//console.log(90071992547409915555588n * 44322); // kh??ng mix bigint v???i type kh??c ???????c

const huge = 9007199254740991555554444n;
const num = 443;
console.log(huge * BigInt(num));

// Exceptions
console.log(20n > 15);
console.log(15n === 15); //  x??t c??? type 
console.log(15n == 15);
console.log(20n == '20');

console.log(huge + ' alo alo 123 ');

// Division
// kh??ng chia ???????c bigint cho int
console.log(10 / 3);
console.log(10n / 3n); // output 3n
console.log(11n / 3n); // output 3n // c???t ph???n th???p ph??n
console.log(12n / 3n); // output 3n

console.log(new Date(0));
console.log(new Date(3 * 24 * 60 * 60 * 1000)); // t??nh ?????n milisecond
console.log(new Date()); // h??m nay
console.log(Date.now()); // h??m nay, ????n v??? milisecond
console.log(new Date(Date.now()));
console.log(new Date(2050, 10, 16, 15, 10, 5)); // n??m , th??ng (h??? s??? t??? 0-11), ng??y, gi???, ph??t, gi??y
console.log(new Date(2068, 15, 11, 36, 2, 6)); // t??nh d???n l??n, th??ng 15 tr??? ??i 11 l?? th??ng 4 n??m sau, gi??? 36 tr??? 24 c???ng th??m 1 ng??y
console.log(new Date(2068, 2, 5));
console.log(new Date('Aug 06 2021 19:22:58')); // kh??ng t??nh d???n ???????c trong tr?????ng h???p n??y ( v?? d??? ghi gi??y l?? 68 s??? b??? invalid)
console.log(new Date('December 22, 2000')); // kh??ng t??nh d???n
console.log(new Date(account1.movementsDates[0]));

const future = new Date(2068, 5, 11, 3, 6, 9, 22);
console.log(future);
console.log(future.getFullYear());
console.log(future.getMonth());
console.log(future.getDay()); // ng??y t??? th??? 2 ?????n cn b???t ?????u t??? 1 !!! kh??c v???i th??ng
console.log(future.getDate());
console.log(future.getHours());
console.log(future.getHours().toString().padStart(2, 0)); // d??ng trong tr?????ng h???p th??m s??? 0 ??? ?????u n???u nh?? mu???n 2 ch??? s??? cho s??? ????n, xem l???i b??i string
console.log(`${future.getMinutes()}`.padStart(2, '0')); // t????ng t??? v???i ph??t, c?? th??? d??ng `${}` mi???n l?? chuy???n ra string , ??? cu???i c?? th??? l?? '0' ho???c 0 ?????u ???????c
console.log(future.getSeconds());
console.log(future.getMilliseconds());
console.log(future.getTimezoneOffset());
console.log(future.getUTCDate());
console.log(future.getUTCDay());
console.log(future.toDateString());
console.log(future.toISOString());
console.log(future.toJSON());
console.log(future.toLocaleDateString());
// c?? r???t nhi???u function d??ng ???????c v???i Date()

future.setFullYear(2099);
console.log(future);




const fakday = new Date(2022, 5, 11, 9, 6, 9, 22);
console.log(+fakday); // + chuy???n d???ng Date th??nh milisecond



console.log(devideDate(new Date(2022, 5, 11),new Date(2022, 5, 19)));



const aaa = 5545343.98967;

const options1 = {
  style: 'unit', // unit, percent, currency -> ch???n m???t trong c??c ki???u ????? hi???n th??? r???i ghi c??? th??? xu???ng d?????i
  unit: 'mile-per-hour', // ho???c ??i???n celsius v???i unit, ngo??i ra n???u style l?? percent th?? unit ph??a d?????i s??? b??? ignore
  useGrouping: true, // ????? hi???n th??? d???u ph??n c??ch, false ????? x??a d???u ph??n c??ch
}

const options2 = {
  style: 'currency', // ch???n 
  currency: 'USD', // currency kh??ng t??? hi???n theo qu???c gia v?? 1 n?????c c?? th??? d??ng nhi???u ti???n t???
}

console.log(navigator.language);
console.log(aaa.toLocaleString(navigator.language, options1));
console.log(Intl.NumberFormat('en-US', options2).format(aaa));



// setTimeout() c??ch d??ng
//var timeoutID = setTimeout(function[, delay, arg1, arg2, ...]); trong arg1, arg2,... l?? value thay v??o function, l??u ?? function ph???i khai b??o s??? l?????ng v?? th??? t??? arg t????ng ???ng
// v?? b???n ch???t h??m trong settimeout ???????c th???c thi kh??c v???i b???i c???nh c???a ch??nh settimeout n??n c??ch ????? g??n gi?? tr??? v??o bi???n trong settimeout l?? thay v??o arg1, arg2,...

const otherIngredients = ['salami', 'tomato']
const onion = 'onion';

const pizzaTimer = setTimeout((arg1, arg2, arg3, arg4) => {
  console.log(`Here is your Pizza ${arg1} and ${arg2} and ${arg3},${arg4}`);
},3000, 'cheese', onion, ...otherIngredients)

console.log('Waiting...');

if(otherIngredients.includes('tomato')) clearTimeout(pizzaTimer) // d??ng l???nh clearTimeout trong tr?????ng h???p mu???n d???ng setTimeout

//setInterval

setInterval(() => {
  console.log(new Date());
},1000)


// countdown from start to 0 then stop
let start = 30;
const countDown = setInterval(() => {
  const j = String(start%60).padStart(2, '0');
  const i = String(Math.floor(start/60)).padStart(2, '0');
  console.log(`${i}:${j}`);
  start--;
  if(start === -1) clearInterval(countDown);
},1000);

*/