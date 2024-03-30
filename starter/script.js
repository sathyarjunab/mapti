'use strict';

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

class workout {
  constructor(coords, distance, duration) {
    this.coords = coords;
    this.distance = distance;
    this.duration = duration;
  }
}
class running extends workout {
  constructor(coords, distance, duration, cadence) {
    super(coords, distance, duration);
    this.cadence = cadence;
    this._calphase();
  }
  _calphase() {
    this.phase = this.duration / this.distance;
  }
}
class cycling extends workout {
  constructor(coords, distance, duration, elevaton) {
    super(coords, distance, duration);
    this.elevaton = elevaton;
    this._calcspeed();
  }
  _calcspeed() {
    this.speed = this.distance / this.duration;
  }
}
const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');
class App {
  #map;
  #mapevent;
  #workout = [];
  constructor() {
    this._getPosition();
    form.addEventListener('submit', this._newWorkout.bind(this));
    inputType.addEventListener('change', this._toggleElevationField);
    this.type = '';
  }
  _newWorkout(e) {
    e.preventDefault();
    let { lat, lng } = this.#mapevent.latlng;
    function valuecheck(...checkvalue) {
      return checkvalue.every(inp => {
        return Number.isFinite(inp) && inp > 0;
      });
    }
    //get data from the form
    let distance = Number(inputDistance.value);
    let duration = Number(inputDuration.value);
    this.type = inputType.value;
    let cadence = Number(inputCadence.value);
    let elevation = Number(inputElevation.value);
    let work;
    //check if they are correct
    if (this.type === 'cycling') {
      if (!valuecheck(distance, duration)) {
        alert('enter the positive number');
        return;
      }
      //creat cycling object
      work = new cycling([lat, lng], distance, duration, elevation);
    }
    if (this.type === 'running') {
      if (!valuecheck(distance, duration, cadence)) {
        alert('enter the positive number');
        return;
      }
      //creat running object
      work = new running([lat, lng], distance, duration, cadence);
    }
    //add object to the workout array
    this.#workout.push(work);
    //render marker on the map
    this._renderWorkoutMap(work);
    //hide thw form + input field
    this._renderWorkout(work);
    this._hideForm();
  }
  _renderWorkout(work) {
    let d = new Date();
    let html = `<li class="workout workout--${this.type}" data-id="1234567890">
    <h2 class="workout__title">${
      this.type[0].toUpperCase() + this.type.slice(1)
    } on ${months[d.getMonth()]} ${d.getDate()}</h2>
    <div class="workout__details">
      <span class="workout__icon">${
        this.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'
      }</span>
      <span class="workout__value">${work.distance}</span>
      <span class="workout__unit">km</span>
    </div>
    <div class="workout__details">
      <span class="workout__icon">⏱</span>
      <span class="workout__value">${work.duration}</span>
      <span class="workout__unit">min</span>
    </div>`;
    console.log(this.type);
    if (this.type === 'running') {
      html += ` <div class="workout__details">
      <span class="workout__icon">⚡️</span>
      <span class="workout__value">${work.phase.toFixed(1)}</span>
      <span class="workout__unit">min/km</span>
    </div>
    <div class="workout__details">
      <span class="workout__icon">🦶🏼</span>
      <span class="workout__value">${work.cadence}</span>
      <span class="workout__unit">spm</span>
    </div>
  </li>`;
    }
    if (this.type === 'cycling') {
      html += `<div class="workout__details">
      <span class="workout__icon">⚡️</span>
      <span class="workout__value">${work.speed.toFixed(1)}</span>
      <span class="workout__unit">km/h</span>
    </div>
    <div class="workout__details">
      <span class="workout__icon">⛰</span>
      <span class="workout__value">${work.elevation}</span>
      <span class="workout__unit">m</span>
    </div>
  </li> -->`;
    }
    form.insertAdjacentHTML('afterend', html);
  }

  _hideForm() {
    inputDistance.value =
      inputDuration.value =
      inputElevation.value =
      inputCadence.value =
        '';
    form.Style.display = 'none';
    form.classList.add('hidden');
    setTimeout(() => (form.Style.display = 'grid'), 1000);
  }
  _renderWorkoutMap(work) {
    L.marker(work.coords)
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 250,
          minWidth: 100,
          autoClose: false,
          closeOnClick: false,
          className: `${this.type}-popup`,
        })
      )
      .setPopupContent('workout')
      .openPopup();
  }
  _getPosition() {
    navigator.geolocation.getCurrentPosition(
      this._loadMap.bind(this),
      function () {
        alert('could not find the location');
      }
    );
  }

  _loadMap(position) {
    const { latitude } = position.coords;
    const { longitude } = position.coords;
    const coord = [latitude, longitude];
    // console.log(`https://www.google.com/maps/@${latitude},${longitude}`);
    this.#map = L.map('map').setView([...coord], 13);

    L.tileLayer('https://tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    this.#map.on('click', this._showForm.bind(this));
  }

  _showForm(mape) {
    this.#mapevent = mape;
    form.classList.remove('hidden');
    inputDistance.focus();
  }

  _toggleElevationField() {
    inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
    inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
  }
}
let app = new App();
let run1 = new running([12.4430625, 75.6906241], 5, 30, 8);
let cyc1 = new cycling([12.4430625, 75.6906241], 9, 78, 9);
console.log(run1);
console.log(cyc1);
