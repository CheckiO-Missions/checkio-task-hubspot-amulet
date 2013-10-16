from checkio.signals import ON_CONNECT
from checkio import api
from checkio.referees.io import CheckiOReferee
from checkio.referees import cover_codes

from tests import TESTS

def checker(data, result):
    if not isinstance(result, (list, tuple)) or len(result) != 3 or not all(isinstance(el, int) for el in result):
        return False, "You should return a list with three integers"
    if not all(-180 <= el <= 180 for el in result):
        return False, "The angles must be in range from -180 to 180 inclusively."
    f, s, t = result
    temp = data[:]
    temp[0] += f
    temp[1] += 2*f
    temp[2] += 3 *f
    temp[0] += 3*s
    temp[1] += s
    temp[2] += 2*s
    temp[0] += 2*t
    temp[1] += 3*t
    temp[2] += t
    temp = [n % 360 for n in temp]
    if temp == [0, 225, 315]:
        return True, "All right!"
    else:
        return False, "Wrong position."

api.add_listener(
    ON_CONNECT,
    CheckiOReferee(
        tests=TESTS,
        cover_code={
            'python-27': cover_codes.unwrap_args,  # or None
            'python-3': cover_codes.unwrap_args
        },
        checker=checker).on_ready)
