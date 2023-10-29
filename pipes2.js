var Pipe2 = function () {
  this.x = 0;
  this.y = 0;

  this.B = 0;

  this.A = 0;

  this.active = 0;

  this.connections = Array.apply(null, new Array(4)).map(
    Number.prototype.valueOf,
    0
  );

  this.isActive = function () {
    return this.active === 1;
  };

  this.setActive = function (active) {
    this.active = active ? 1 : 0;
  };

  /**
   *
   *
   * @param {grid2.direction} direction
   */
  this.getNeighbour = function (direction) {
    var dx = 0;
    var dy = 0;

    if (direction == grid2.direction.RIGHT) {
      dy = 1;
    } else if (direction == grid2.direction.LEFT) {
      dy = -1;
    }

    if (direction == grid2.direction.UP) {
      dx = -1;
    } else if (direction == grid2.direction.DOWN) {
      dx = 1;
    }

    return grid2.getPipe(this.x + dx, this.y + dy);
  };

  this.hasConnection = function (direction) {
    return this.connections[direction] === 1;
  };

  this.rotate = function () {
    this.connections.splice(
      0,
      0,
      this.connections.splice(this.connections.length - 1, 1)[0]
    );
  };
};

var grid2 = {
  size: 0,

  pipes: [],

  direction: {
    DOWN: 2,
    LEFT: 3,
    RIGHT: 1,
    UP: 0
  },

  reverse_direction: {
    2: 0,
    3: 1,
    1: 3,
    0: 2
  },

  init: function (size) {
    this.initPipes(size);

    this.buildPipes();
    this.scramblePipes();

    this.checkPipes();

    this.draw();
  },

  /**
   *
   *
   * @param {Number} x
   * @param {Number} y
   */
  getPipe: function (x, y) {
    if (
      typeof this.pipes[x] !== 'undefined' &&
      typeof this.pipes[x][y] !== 'undefined'
    ) {
      return this.pipes[x][y];
    }
  },

  getPipes: function () {
    var pipes = [];
    for (x in this.pipes) {
      for (y in this.pipes[x]) {
        pipes.push(this.getPipe(x, y));
      }
    }

    return pipes;
  },

  /**
   *
   *
   * @param {Number} size
   */
  initPipes: function (size) {
    this.size = size;
    this.pipes = [];
    for (x = 1; x <= size; x++) {
      this.pipes[x] = [];
      for (y = 1; y <= size; y++) {
        pipe = new Pipe2();
        pipe.x = x;
        pipe.y = y;

        this.pipes[x][y] = pipe;
      }
    }
  },

  buildPipes: function () {
    pipe_B = new Pipe();

    var total_pipes = this.size * this.size;
    var connected_pipes = [];

    pipe = this.getPipe(this.size, this.size);
    pipe.B = 1;

    var x = 1;
    var y = 1;

    pipe = this.getPipe(x, y);
    pipe.active = 1;
    pipe.A = 1;
    pipe.connections = [1, 1, 1, 1];
    connected_pipes.push(pipe);

    while (connected_pipes.length < total_pipes) {
      var pipe =
        connected_pipes[Math.floor(Math.random() * connected_pipes.length)];

      var direction = Math.floor(Math.random() * 4);

      var neighbor = pipe.getNeighbour(direction);
      var reverse_direction = this.reverse_direction[direction];

      if (
        typeof neighbor != 'undefined' &&
        neighbor.connections.indexOf(1) == -1
      ) {
        pipe.connections[direction] = 1;
        neighbor.connections[reverse_direction] = 1;
        connected_pipes.push(neighbor);
      }
    }

    for (x = 1; x < this.pipes.length; x++) {
      for (y = 1; y < this.pipes.length; y++) {
        var pipe = this.getPipe(x, y);
        end_pipe_connections_1 = [1, 0, 0, 0];
        end_pipe_connections_2 = [0, 0, 0, 1];
        end_pipe_connections_3 = [0, 1, 0, 0];
        end_pipe_connections_4 = [0, 0, 1, 0];
        if (equar(pipe.connections, end_pipe_connections_1)) {
          pipe.connections = [1, 1, 0, 0];
        }
        if (equar(pipe.connections, end_pipe_connections_2)) {
          pipe.connections = [0, 1, 1, 0];
        }
        if (equar(pipe.connections, end_pipe_connections_3)) {
          pipe.connections = [0, 0, 1, 1];
        }
        if (equar(pipe.connections, end_pipe_connections_4)) {
          pipe.connections = [1, 0, 0, 1];
        }
      }
    }

    for (x = 1; x < this.pipes.length; x++) {
      for (y = 1; y < this.pipes.length; y++) {
        var pipe = this.getPipe(x, y);
        pipe_connections = [1, 1, 1, 1];
        if (equar(pipe.connections, pipe_connections)) {
          pipe.connections = [0, 1, 1, 0];
        }
      }
    }

    for (x = 1; x < this.pipes.length; x++) {
      for (y = 1; y < this.pipes.length; y++) {
        var pipe = this.getPipe(x, y);
        pipe3_connections1 = [1, 1, 1, 0];
        pipe3_connections2 = [0, 1, 1, 1];
        pipe3_connections3 = [1, 0, 1, 1];
        pipe3_connections4 = [1, 1, 0, 1];
        if (equar(pipe.connections, pipe3_connections1)) {
          pipe.connections = [1, 1, 0, 0];
        }
        if (equar(pipe.connections, pipe3_connections2)) {
          pipe.connections = [0, 1, 1, 0];
        }
        if (equar(pipe.connections, pipe3_connections3)) {
          pipe.connections = [1, 0, 0, 1];
        }
        if (equar(pipe.connections, pipe3_connections4)) {
          pipe.connections = [1, 1, 0, 0];
        }
      }
    }
  },

  scramblePipes: function () {
    for (x = 1; x < this.pipes.length; x++) {
      for (y = 1; y < this.pipes.length; y++) {
        var pipe = this.getPipe(x, y);
        var random = Math.floor(Math.random() * 4);
        for (i = 0; i < random; i++) {
          pipe.rotate();
        }
      }
    }

    pipe = this.getPipe(1, 1);
    var random = Math.floor(Math.random() * 2) + 1;
    if (random == 1) {
      pipe.connections = [0, 1, 0, 0];
    } else if (random == 2) {
      pipe.connections = [0, 0, 1, 0];
    }

    pipe = this.getPipe(this.size, this.size);
    var random = Math.floor(Math.random() * 2) + 1;
    if (random == 1) {
      pipe.connections = [1, 0, 0, 0];
    } else if (random == 2) {
      pipe.connections = [0, 0, 0, 1];
    }
  },

  deactivatePipes: function () {
    for (x = 1; x < this.pipes.length; x++) {
      for (y = 1; y < this.pipes.length; y++) {
        this.getPipe(x, y).setActive(false);
      }
    }
  },

  checkPipes: function () {
    connected_pipes = [];
    pipes_to_check = [];

    this.deactivatePipes();

    var first_pipe = this.getPipe(1, 1);
    first_pipe.setActive(true);

    connected_pipes.push(first_pipe);
    pipes_to_check.push(first_pipe);

    while (pipes_to_check.length > 0) {
      var pipe = pipes_to_check.pop();
      var x = pipe.x;
      var y = pipe.y;

      if (pipe.hasConnection(grid2.direction.UP)) {
        var pipe_above = this.getPipe(x - 1, y);
        if (
          typeof pipe_above !== 'undefined' &&
          pipe_above.hasConnection(grid2.direction.DOWN) &&
          !pipe_above.isActive()
        ) {
          pipe_above.setActive(true);

          connected_pipes.push(pipe_above);
          pipes_to_check.push(pipe_above);
        }
      }

      if (pipe.hasConnection(grid2.direction.DOWN)) {
        var pipe_below = this.getPipe(x + 1, y);
        if (
          typeof pipe_below !== 'undefined' &&
          pipe_below.hasConnection(grid2.direction.UP) &&
          !pipe_below.isActive()
        ) {
          pipe_below.setActive(true);

          connected_pipes.push(pipe_below);
          pipes_to_check.push(pipe_below);
        }
      }

      if (pipe.hasConnection(grid2.direction.RIGHT)) {
        var pipe_next = this.getPipe(x, y + 1);
        if (
          typeof pipe_next !== 'undefined' &&
          pipe_next.hasConnection(grid2.direction.LEFT) &&
          !pipe_next.isActive()
        ) {
          pipe_next.setActive(true);

          connected_pipes.push(pipe_next);
          pipes_to_check.push(pipe_next);
        }
      }

      if (pipe.hasConnection(grid2.direction.LEFT)) {
        var pipe_previous = this.getPipe(x, y - 1);
        if (
          typeof pipe_previous !== 'undefined' &&
          pipe_previous.hasConnection(grid2.direction.RIGHT) &&
          !pipe_previous.isActive()
        ) {
          pipe_previous.setActive(true);

          connected_pipes.push(pipe_previous);
          pipes_to_check.push(pipe_previous);
        }
      }
    }

    connected_pipes.forEach((pipe) => {
      if (pipe.B == 1) {
        alert('Chúc Mừng Bạn Đã Chiến Thắng !!!');
      }
    });
  },

  draw: function () {
    var grid2_div = document.getElementById('grid_2');
    grid2_div.innerHTML = '';

    for (x in this.pipes) {
      var row = this.pipes[x];

      var row_div = document.createElement('div');
      row_div.className = 'rowofpipe';

      for (y in row) {
        var pipe = row[y];
        var pipe_div = document.createElement('div');

        pipe_div.className = 'pipe';

        pipe_div.setAttribute('data-x', x);
        pipe_div.setAttribute('data-y', y);

        pipe_div.setAttribute('onClick', 'rotatePipe(this)');

        if (pipe.connections[0] === 1) {
          pipe_div.className += ' u';
        }

        if (pipe.connections[1] === 1) {
          pipe_div.className += ' r';
        }

        if (pipe.connections[2] === 1) {
          pipe_div.className += ' d';
        }

        if (pipe.connections[3] === 1) {
          pipe_div.className += ' l';
        }

        if (pipe.active == 1) {
          pipe_div.className += ' a';
        }

        if (pipe.B == 1) {
          pipe_div.className += ' B';
        }

        if (pipe.A == 1) {
          pipe_div.className += ' A';
        }

        row_div.appendChild(pipe_div);
      }

      grid2_div.appendChild(row_div);
    }
  }
};

function rotatePipe(element) {
  var x = element.dataset.x;
  var y = element.dataset.y;

  grid2.getPipe(x, y).rotate();
  grid2.checkPipes();
  grid2.draw();
}

grid2.init(11);

function clickNew2() {
  grid2.init(11);
}
