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
  //hour: 'numeric', // nếu muốn xuất hiện thì bỏ comment đi
  //minute: 'numeric', // nếu muốn xuất hiện thì bỏ comment đi
  day: 'numeric',
  //month: 'long', // tùy ngôn ngữ mới hiện cả tháng
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
  startTimer(); // timer tự làm 
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

// timer tự làm 



const startTimer = function() {
  if (countDown) {
    clearInterval(countDown);
    labelTimer.textContent = '';
  }
  //Set timer at 5:00
  let start = 300;
  // phải tách interVal ra khỏi setInterval để startTimer chạy ngay lập tức ko thì sẽ phải chờ 1s !! tip
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
  interVal(); // phải chạy ở đây trước
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
// parsing: chỉ lấy gía trị số
console.log(Number.parseInt('68px')); // output: 68
console.log(Number.parseInt('  99rem ')); // output: 99
console.log(Number.parseInt('22px', 10)); // output : 22 //hệ 10
console.log(Number.parseInt('22px', 2)); // output: NaN // hệ 2 
console.log(Number.parseInt(1000, 2)); // output: 8 // hệ 2
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
console.log(randomInt(-6,8)); // thay trunc bằng floor

//rounding

console.log(Math.trunc(Math.round(68.4)));
console.log(Math.sign(-99)); // số âm => -1
console.log(Math.sign(68)); // số dương => 1
console.log(Math.sign(0)); // 0 => 0

console.log(Math.floor('45.3')); // làm tròn xuống , giống trunc
console.log(Math.floor(45.8)); // làm tròn xuống

console.log(Math.ceil(45.2)); // làm tròn lên
console.log(Math.ceil('45.8')); // làm tròn lên

console.log(Math.floor(-45.8));
console.log(Math.ceil(-45.8));
console.log(Math.trunc(-45.8));
// => floor thay thế trunc tốt hơn trong bài tìm min max

console.log(Math.fround(68.67));

console.log(Number(68.45.toFixed(0)));
console.log(68.45.toFixed(2)); // hàm toFixed() lấy giá trị sau dấu phẩy và tự làm tròn
console.log(+68.45.toFixed(6)); // chuyển từ string ra number
console.log(68.45554.toFixed(2));

const isEven = x => x%2 === 0;
console.log(isEven(6));

labelBalance.addEventListener('click', function() {
  // PHẦN NÀY PHẢI NẰM TRONG EVENT HANDLER , NẾU NẰM NGOÀI SẼ KHÔNG CHẠY => VÌ NÓ ĐƯỢC EXECUTE NGAY KHI CODE CHẠY, NÊN LÚC ĐĂNG NHẬP SẼ KHÔNG CHẠY LẠI NỮA
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
console.log(BigInt(900719925474099155555n)); // sai vì js sẽ in số này như int rồi mới chuyển thành bigint, chỉ nên dùng với số nhỏ

// Operations

console.log(20000n + 30000n);
console.log(900719925474099155555n + 90071992547409915555588n);
//console.log(Math.sqrt(25n)); // not working 


console.log(90071992547409915555588n * 44322n);
//console.log(90071992547409915555588n * 44322); // không mix bigint với type khác được

const huge = 9007199254740991555554444n;
const num = 443;
console.log(huge * BigInt(num));

// Exceptions
console.log(20n > 15);
console.log(15n === 15); //  xét cả type 
console.log(15n == 15);
console.log(20n == '20');

console.log(huge + ' alo alo 123 ');

// Division
// không chia được bigint cho int
console.log(10 / 3);
console.log(10n / 3n); // output 3n
console.log(11n / 3n); // output 3n // cắt phần thập phân
console.log(12n / 3n); // output 3n

console.log(new Date(0));
console.log(new Date(3 * 24 * 60 * 60 * 1000)); // tính đến milisecond
console.log(new Date()); // hôm nay
console.log(Date.now()); // hôm nay, đơn vị milisecond
console.log(new Date(Date.now()));
console.log(new Date(2050, 10, 16, 15, 10, 5)); // năm , tháng (hệ số từ 0-11), ngày, giờ, phút, giây
console.log(new Date(2068, 15, 11, 36, 2, 6)); // tính dồn lên, tháng 15 trừ đi 11 là tháng 4 năm sau, giờ 36 trừ 24 cộng thêm 1 ngày
console.log(new Date(2068, 2, 5));
console.log(new Date('Aug 06 2021 19:22:58')); // không tính dồn được trong trường hợp này ( ví dụ ghi giây là 68 sẽ bị invalid)
console.log(new Date('December 22, 2000')); // không tính dồn
console.log(new Date(account1.movementsDates[0]));

const future = new Date(2068, 5, 11, 3, 6, 9, 22);
console.log(future);
console.log(future.getFullYear());
console.log(future.getMonth());
console.log(future.getDay()); // ngày từ thứ 2 đến cn bắt đầu từ 1 !!! khác với tháng
console.log(future.getDate());
console.log(future.getHours());
console.log(future.getHours().toString().padStart(2, 0)); // dùng trong trường hợp thêm số 0 ở đầu nếu như muốn 2 chữ số cho số đơn, xem lại bài string
console.log(`${future.getMinutes()}`.padStart(2, '0')); // tương tự với phút, có thể dùng `${}` miễn là chuyển ra string , ở cuối có thể là '0' hoặc 0 đều được
console.log(future.getSeconds());
console.log(future.getMilliseconds());
console.log(future.getTimezoneOffset());
console.log(future.getUTCDate());
console.log(future.getUTCDay());
console.log(future.toDateString());
console.log(future.toISOString());
console.log(future.toJSON());
console.log(future.toLocaleDateString());
// có rất nhiều function dùng được với Date()

future.setFullYear(2099);
console.log(future);




const fakday = new Date(2022, 5, 11, 9, 6, 9, 22);
console.log(+fakday); // + chuyển dạng Date thành milisecond



console.log(devideDate(new Date(2022, 5, 11),new Date(2022, 5, 19)));



const aaa = 5545343.98967;

const options1 = {
  style: 'unit', // unit, percent, currency -> chọn một trong các kiểu để hiển thị rồi ghi cụ thể xuống dưới
  unit: 'mile-per-hour', // hoặc điền celsius với unit, ngoài ra nếu style là percent thì unit phía dưới sẽ bị ignore
  useGrouping: true, // để hiển thị dấu phân cách, false để xóa dấu phân cách
}

const options2 = {
  style: 'currency', // chọn 
  currency: 'USD', // currency không tự hiện theo quốc gia vì 1 nước có thể dùng nhiều tiền tệ
}

console.log(navigator.language);
console.log(aaa.toLocaleString(navigator.language, options1));
console.log(Intl.NumberFormat('en-US', options2).format(aaa));



// setTimeout() cách dùng
//var timeoutID = setTimeout(function[, delay, arg1, arg2, ...]); trong arg1, arg2,... là value thay vào function, lưu ý function phải khai báo số lượng và thứ tự arg tương ứng
// vì bản chất hàm trong settimeout được thực thi khác với bối cảnh của chính settimeout nên cách để gán giá trị vào biến trong settimeout là thay vào arg1, arg2,...

const otherIngredients = ['salami', 'tomato']
const onion = 'onion';

const pizzaTimer = setTimeout((arg1, arg2, arg3, arg4) => {
  console.log(`Here is your Pizza ${arg1} and ${arg2} and ${arg3},${arg4}`);
},3000, 'cheese', onion, ...otherIngredients)

console.log('Waiting...');

if(otherIngredients.includes('tomato')) clearTimeout(pizzaTimer) // dùng lệnh clearTimeout trong trường hợp muốn dừng setTimeout

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