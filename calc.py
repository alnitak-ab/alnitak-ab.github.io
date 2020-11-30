from numpy import floor, log2, float32, array, zeros
p2 = array([128., 32768., 8388608.], dtype=float32)
def encode(v):
    c = zeros(4, dtype=float32)
    e = floor(log2(v))
    m = v / 2**e - 1.0
    c[1:] = floor(m * p2) % 256
    e += 127.0
    c[0] += floor(e / 2.0)
    c[1] += (e % 2.0) * 128.0
    return ' '.join(hex(int(a)) for a in c)

def encode2(v):
    x = array([v], dtype=float32)
    return ' '.join(hex(a) for a in x.view(dtype='uint8')[::-1])
