var Pipe = function () {
  this.x = 0; //Tọa độ x của ống
  this.y = 0; //Tọa độ y của ống

  this.B = 0; //thuộc tính kích hoạt ống điểm B (nếu là điểm B thì = 1)

  this.A = 0; //thuộc tính kích hoạt ống điểm A (nếu là điểm A thì = 1)

  this.active = 0; //điểm kích hoạt ống

  // Mảng chứa hướng kêt nối của ống
  // [Trên, Phải, Dưới, Trái] = [x, x, x, x]
  // VD: ống chữ thập có 4 hướng kết nối [1, 1, 1, 1]
  // VD: ống thẳng có 2 hướng kết nối trên dưới [1, 0, 0, 1]
  // VD: ống cong có 2 hướng kết nối [0, 1, 1, 0]
  // VD: ống có 3 hướng kết nối [0, 1, 1, 1]
  this.connections = Array.apply(null, new Array(4)).map(
    Number.prototype.valueOf,
    0
  );

  this.isActive = function () {
    return this.active === 1;
  }; //Kiểm tra thuộc tính active đã là 1 chưa ?

  this.setActive = function (active) {
    this.active = active ? 1 : 0;
  }; //Kích hoạt thuộc tính active đã là 1 chưa ?

  /**
   * Tìm ống tiếp theo của ống đang xét dựa vào hướng đi (direction)
   *
   * @param {grid.direction} direction
   */
  this.getNeighbour = function (direction) {
    var dx = 0; //Độ lệch tọa độ x
    var dy = 0; //Độ lệch tọa độ y

    if (direction == grid.direction.RIGHT) {
      dy = 1; //Nếu ống qua phải thì tăng y lên 1
    } else if (direction == grid.direction.LEFT) {
      dy = -1; //Nếu ống qua trái thì giảm y xuống 1
    }

    if (direction == grid.direction.UP) {
      dx = -1; //Nếu ống lên trên thì giảm x xuống 1
    } else if (direction == grid.direction.DOWN) {
      dx = 1; //Nếu ống đi xuống thì tăng x lên 1
    }

    return grid.getPipe(this.x + dx, this.y + dy);
    //Trả về ống tiếp theo sau khi cộng trừ độ lệch
  };

  this.hasConnection = function (direction) {
    return this.connections[direction] === 1;
  };
  //Kiểm tra đã có kết nối với ống nào chưa

  this.rotate = function () {
    this.connections.splice(
      0,
      0,
      this.connections.splice(this.connections.length - 1, 1)[0]
    );
  };
  //Xoay ống, bằng cách lấy di chuyển về sau một đơn vị với mỗi ptu
  //VD: [0, A, B, 0] => [0, 0, A, B]
};

/**
 * Khai lớp bàn chơi
 */
var grid = {
  size: 0, //Kích thước

  pipes: [], //Mảng chứa vị trí, mỗi vị trí chứa một phần tử lớp Pipe ở trên

  /**
   * Hướng đi của ống đang xét
   */
  direction: {
    DOWN: 2,
    LEFT: 3,
    RIGHT: 1,
    UP: 0
  },

  /**
   * Hướng đối nghịch (đối nghịch mới kết nối được)
   */
  reverse_direction: {
    2: 0,
    3: 1,
    1: 3,
    0: 2
  },

  /**
   * Khởi tạo bàn chơi thông qua 4 hàm
   */
  init: function (size) {
    this.initPipes(size); //Tạo khung lưới (Mảng 2 chiều)
    /**
     * Hàm để sinh ra tất cả các đường kết nối tất cả các ống vs nhau từ ống được chọn đầu tiên
     */
    this.buildPipes();
    this.scramblePipes(); //Xoay random các ống nước nhìn cho rối mắt xíu

    //Hàm kiểm tra ống có kết nối không, nếu có thì thêm thuộc tính kết nối, để vẽ lên trình duyệt
    this.checkPipes();

    //Hàm vẽ ống lên trình duyệt, dựa vào các thuộc tính của ống được in -> CSS chèn ảnh vào
    this.draw();
  },

  /**
   * Lấy đối tượng tại vị trí mà mảng 2 chiều đang đứng
   * VD: pipes[1,1] thì lấy đối tượng pipe nào có thuộc tính x=1 và y=1
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

  /**
   * Lấy tất cả đối tượng pipe trên toàn mảng
   */
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
   * Khởi tạo bàn chơi bằng mảng 2 chiều sử dụng 2 dòng lặp for
   *
   * @param {Number} size
   */
  initPipes: function (size) {
    this.size = size;
    this.pipes = [];
    for (x = 1; x <= size; x++) {
      this.pipes[x] = [];
      for (y = 1; y <= size; y++) {
        pipe = new Pipe(); //Với mỗi ô mà mảng duyệt tới sẽ tạo một phần tử pipe đứng trên đó và giữ tọa độ x,y tại đó
        pipe.x = x;
        pipe.y = y;

        this.pipes[x][y] = pipe;
      }
    }
  },

  /**
   * Tạo ra tất cả đường kết nối đến với mọi ống
   */
  buildPipes: function () {
    //Tạo một đối tượng pipe_B để giữ điểm B cần đến
    pipe_B = new Pipe();

    // Khởi tạo 2 biến, mảng chứa ống đã được tạo (connected_pipes)
    // Và biến chứa tổng số ống cần tạo (total_pipes)
    var total_pipes = this.size * this.size;
    var connected_pipes = [];

    //Lấy đối tượng pipe ở cuối bàn chơi [11,11]
    //Rồi gán thuộc tính đích (B=1)
    pipe = this.getPipe(this.size, this.size);
    pipe.B = 1;

    /**
     * Khởi tạo nguồn (nguồn nước ban đầu) là vị trí đầu tiên
     * set active lên
     * set thuộc tính nguồn (A=1)
     * đặt hướng kết nối cho nó là 4 hướng [1,1,1,1]
     * add vào mảng connected_pipes để bắt đầu tìm đường đi
     */
    var x = 1;
    var y = 1;

    pipe = this.getPipe(x, y);
    pipe.active = 1;
    pipe.A = 1;
    pipe.connections = [1, 1, 1, 1];
    connected_pipes.push(pipe);

    /**
     * Thuật toán khởi tạo các ống với điều kiện tất cả phải kết nối được với nhau
     */

    while (connected_pipes.length < total_pipes) {
      //Nếu số ống được tạo còn ít hơn tổng số ống thì tạo tiếp
      // Chọn ngẫu nhiên một ống trong mảng chứa những ống đã đc tạo
      var pipe =
        connected_pipes[Math.floor(Math.random() * connected_pipes.length)];

      // Chọn ngẫu nhiên hướng đi cho ống đó
      var direction = Math.floor(Math.random() * 4);

      //Lấy ống kế bên theo hướng đi
      var neighbor = pipe.getNeighbour(direction);
      var reverse_direction = this.reverse_direction[direction];

      if (
        typeof neighbor != 'undefined' &&
        neighbor.connections.indexOf(1) == -1
      ) {
        pipe.connections[direction] = 1; //Mở hướng kết nối của ống đang xét
        neighbor.connections[reverse_direction] = 1; //Mở hướng kết nối của ống kế bên mà đối nghịch vs ống trên
        connected_pipes.push(neighbor); //Thêm vào mảng chứa các ống đã đc tạo
        //if (neighbor.B == 1) { console.log('Tìm thấy đường đến B'); } //Xuất ra nếu trong trình tạo, mảng tìm thấy điểm B
      }
    }

    //Đổi ống end thành ống thẳng
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

    // for (x = 1; x < this.pipes.length; x++) {
    //     for (y = 1; y < this.pipes.length; y++) {
    //         var pipe = this.getPipe(x, y);
    //         pipe_connections = [1, 1, 1, 1];
    //         if (equar(pipe.connections, pipe_connections)) {
    //             pipe.connections = [0, 1, 1, 0];
    //         }
    //     }
    // }

    // for (x = 1; x < this.pipes.length; x++) {
    //     for (y = 1; y < this.pipes.length; y++) {
    //         var pipe = this.getPipe(x, y);
    //         pipe3_connections1 = [1, 1, 1, 0];
    //         pipe3_connections2 = [0, 1, 1, 1];
    //         pipe3_connections3 = [1, 0, 1, 1];
    //         pipe3_connections4 = [1, 1, 0, 1];
    //         if (equar(pipe.connections, pipe3_connections1)) {
    //             pipe.connections = [1, 1, 0, 0];
    //         }
    //         if (equar(pipe.connections, pipe3_connections2)) {
    //             pipe.connections = [0, 1, 1, 0];
    //         }
    //         if (equar(pipe.connections, pipe3_connections3)) {
    //             pipe.connections = [1, 0, 0, 1];
    //         }
    //         if (equar(pipe.connections, pipe3_connections4)) {
    //             pipe.connections = [1, 1, 0, 0];
    //         }
    //     }
    // }
  },

  /**
   * Xáo trộn các ống bằng cách random các hướng kết nối
   */
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

    //Cố định đầu A chỉ có thể qua phải hoặc xuống dưới
    pipe = this.getPipe(1, 1);
    var random = Math.floor(Math.random() * 2) + 1;
    if (random == 1) {
      pipe.connections = [0, 1, 0, 0];
    } else if (random == 2) {
      pipe.connections = [0, 0, 1, 0];
    }

    //Cố định đầu B chỉ có thể qua trái hoặc lên trên
    pipe = this.getPipe(this.size, this.size);
    var random = Math.floor(Math.random() * 2) + 1;
    if (random == 1) {
      pipe.connections = [1, 0, 0, 0];
    } else if (random == 2) {
      pipe.connections = [0, 0, 0, 1];
    }
  },

  /**
   * Tắt active tất cả các ống
   */
  deactivatePipes: function () {
    for (x = 1; x < this.pipes.length; x++) {
      for (y = 1; y < this.pipes.length; y++) {
        this.getPipe(x, y).setActive(false);
      }
    }
  },

  /**
   * Kiểm tra tất cả các ống nếu được kết nối vs ống active
   */
  checkPipes: function () {
    connected_pipes = [];
    pipes_to_check = [];

    // Tắt tất cả các ống
    this.deactivatePipes();

    // Lấy ống đầu tiên, active lên, và đưa vào mảng chứa để kiểm tra

    var first_pipe = this.getPipe(1, 1);
    first_pipe.setActive(true);

    connected_pipes.push(first_pipe);
    pipes_to_check.push(first_pipe);

    // Nếu vẫn còn ống nằm trong hàng đợi thì check tiếp
    while (pipes_to_check.length > 0) {
      var pipe = pipes_to_check.pop(); // lấy (vị trí) ptu trên cùng của hàng đợi, lấy cái đối tượng pipe nằm ngay vị trí đó
      var x = pipe.x; //Lấy tọa độ x của đối tượng pipe
      var y = pipe.y; //Lấy tọa độ y của đối tượng pipe

      // Nếu có kết nối ở trên thì lấy kết nối
      if (pipe.hasConnection(grid.direction.UP)) {
        var pipe_above = this.getPipe(x - 1, y);
        if (
          typeof pipe_above !== 'undefined' &&
          pipe_above.hasConnection(grid.direction.DOWN) &&
          !pipe_above.isActive()
        ) {
          pipe_above.setActive(true);

          connected_pipes.push(pipe_above);
          pipes_to_check.push(pipe_above);
        }
      }

      // Nếu có kết nối ở dưới thì lấy kết nối
      if (pipe.hasConnection(grid.direction.DOWN)) {
        var pipe_below = this.getPipe(x + 1, y);
        if (
          typeof pipe_below !== 'undefined' &&
          pipe_below.hasConnection(grid.direction.UP) &&
          !pipe_below.isActive()
        ) {
          pipe_below.setActive(true);

          connected_pipes.push(pipe_below);
          pipes_to_check.push(pipe_below);
        }
      }

      // Nếu có kết nối bên phải thì lấy bên phải
      if (pipe.hasConnection(grid.direction.RIGHT)) {
        var pipe_next = this.getPipe(x, y + 1);
        if (
          typeof pipe_next !== 'undefined' &&
          pipe_next.hasConnection(grid.direction.LEFT) &&
          !pipe_next.isActive()
        ) {
          pipe_next.setActive(true);

          connected_pipes.push(pipe_next);
          pipes_to_check.push(pipe_next);
        }
      }

      // Nếu có kết nối bên trái thì lấy bên trái
      if (pipe.hasConnection(grid.direction.LEFT)) {
        var pipe_previous = this.getPipe(x, y - 1);
        if (
          typeof pipe_previous !== 'undefined' &&
          pipe_previous.hasConnection(grid.direction.RIGHT) &&
          !pipe_previous.isActive()
        ) {
          pipe_previous.setActive(true);

          connected_pipes.push(pipe_previous);
          pipes_to_check.push(pipe_previous);
        }
      }
    }
    // Kiểm tra nếu những ống đang kết nối gặp điểm đích sẽ thông báo
    connected_pipes.forEach((pipe) => {
      if (pipe.B == 1) {
        alert('Chúc Mừng Bạn Đã Chiến Thắng !!!');
      }
    });
  },

  /**
   * In HTML lên trình duyệt, CSS sẽ add hình
   */
  draw: function () {
    var grid_div = document.getElementById('grid');
    grid_div.innerHTML = '';

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

      grid_div.appendChild(row_div);
    }
  },
  /**
   * Thuật toán leo đồi
   */
  hillclimbing: function () {
    var count = 1; //Khởi tạo biến đêm khi cho chạy while

    while (pipe_B.active != 1 && count <= 10000) {
      //Nếu B chưa active và lượt chạy nhỏ hơn 100 thì chạy tiếp

      grid.checkPipes(); //Kiểm tra tình trạng bàn chơi

      pipe = this.getPipe(this.size, this.size);
      pipe_B = pipe; //Lấy ống đích (B)

      var current_pipe = this.getPipe(1, 1); //Lấy ống hiện tại là ống đầu tiên

      var neighbor_ex = current_pipe; //Lấy ống kế tiếp cũng là ống đầu tiên luôn

      /**
       * Hàm này để duyệt lại các ống đã kết nối để tìm ra ống có khoảng cách gần đích nhất
       * Nếu tồn tại 2 ống có khoảng cách bằng nhau thì chọn random 1 ống
       */
      connected_pipes.forEach((pipe) => {
        if (
          Math.round(this.distance(pipe, pipe_B)) <
          Math.round(this.distance(current_pipe, pipe_B))
        ) {
          current_pipe = pipe;
        } else if (
          Math.round(this.distance(pipe, pipe_B)) ==
          Math.round(this.distance(current_pipe, pipe_B))
        ) {
          var random = Math.floor(Math.random() * 2) + 1;
          if (random == 1) {
            current_pipe = pipe;
          }
        }
      });

      /**
       * Hàm này dựa vào ống hiện tại (current_pipe) ở trên sinh ra các ống có thể đi đựa vào khoảng cách gần nhất và chưa được kết nối
       * Nếu tồn tại các ống có đánh giá bằng nhau thì chọn random 1 trong 2 ống
       */
      for (var u = 1; u <= 4; u++) {
        if (current_pipe.active == 1) {
          for (var i = 0; i < 4; i++) {
            if (current_pipe.connections[i] == 1) {
              neighbor = current_pipe.getNeighbour(i);
              if (typeof neighbor != 'undefined') {
                if (
                  Math.round(this.distance(neighbor, pipe_B)) <
                  Math.round(this.distance(current_pipe, pipe_B))
                ) {
                  neighbor_ex = neighbor;
                } else if (
                  Math.round(this.distance(neighbor, pipe_B)) ==
                  Math.round(this.distance(current_pipe, pipe_B))
                ) {
                  var random = Math.floor(Math.random() * 2) + 1;
                  if (random == 1) {
                    neighbor_ex = neighbor;
                  } else if (random == 2) {
                    neighbor_ex = current_pipe;
                  }
                }
              }
            }
          }
        }
        current_pipe.rotate();
        grid.checkPipes();
        grid.draw();
      }

      /**
       * Hàm này có 2 vòng lặp
       * Đầu tiên cho ống kế bên xoay nếu được kích hoạt thì thoát
       * Nếu ống kế bên xoay 4 lần mà chưa kích hoạt được thì ống hiện tại sẽ xoay 1 lần
       * Lập đến khi nào 2 ống này được kết nối với nhau
       */
      for (var u = 1; u <= 4; u++) {
        for (var v = 1; v <= 4; v++) {
          neighbor_ex.rotate();
          grid.checkPipes();
          if (neighbor_ex.active == 1) {
            break;
          }
        }
        current_pipe.rotate();
        grid.checkPipes();
        if (neighbor_ex.active == 1) {
          break;
        }
      }

      //In lại trạng thái ống lên bàn chơi
      grid.draw();

      //Tăng biến đếm lên 1 đơn vị
      count++;
    }

    /**
     * Nếu chạy xong giải thuật mà chưa tìm thấy kết quả thì sẽ thông báo thử lại với trường hợp khác
     */
    pipe = this.getPipe(this.size, this.size);
    pipe_B = pipe;
    if (pipe_B.active != 1) {
      alert('THỬ LẠI !!!');
    }
  },

  /**
   *
   * Hàm này dùng để kiểm tra 2 ống đã có đường kết nối trực tiếp hay chưa
   */
  isNeighbor: function (pipe_1, pipe_2) {
    for (var i = 0; i < 4; i++) {
      if (pipe_1.connections[i] == 1) {
        neighbor = pipe_1.getNeighbour(i);
        if (
          typeof neighbor != 'undefined' &&
          neighbor.x == pipe_2.x &&
          neighbor.y == pipe_2.y
        ) {
          return true;
        } else return false;
      }
    }
  },

  /**
   *
   * Hàm này là hàm đánh giá khoảng cách giữa các ống để chọn hướng đi tiếp theo
   */
  distance: function (pipe1, pipe2) {
    var distance;
    distance = Math.sqrt(
      Number(pipe1.y - pipe2.y) * (pipe1.y - pipe2.y) +
        (pipe1.x - pipe2.x) * (pipe1.x - pipe2.x)
    );
    return distance;
  }
};

//Mỗi khi nhấp chuột sẽ gọi hàm này
function rotatePipe(element) {
  var x = element.dataset.x;
  var y = element.dataset.y;

  grid.getPipe(x, y).rotate();
  grid.checkPipes();
  grid.draw();
}

grid.init(11); //Hàm khởi tạo toàn bộ code

//Khi Click nút new sẽ tạo lại hết code
function clickNew() {
  grid.init(11);
}

//Khi Click nút auto sẽ thực thi hàm hill-climbing
function clickAuto() {
  grid.hillclimbing();
}

//Hàm so sánh 2 mảng
function equar(a, b) {
  if (a.length !== b.length) {
    return false;
  } else {
    for (let i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) {
        return false;
      }
    }
    return true;
  }
}
