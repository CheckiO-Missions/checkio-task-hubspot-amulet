from checkio.signals import ON_CONNECT
from checkio import api
from checkio.referees.io import CheckiOReferee
from checkio.referees import cover_codes

from tests import TESTS


def checker(matrix, result):
    if not isinstance(result, (list, tuple)) or len(result) != 3 or not all(isinstance(el, int) for el in result):
        return False, (False, "You should return a list with three integers")
    if not all(-180 <= el <= 180 for el in result):
        return False, (False, "The angles must be in range from -180 to 180 inclusively.")
    f, s, t = result
    temp = [0, 0, 0]
    temp[0] += f
    temp[1] += matrix[0][1] * f
    temp[2] += matrix[0][2] * f

    temp[0] += matrix[1][0] * s
    temp[1] += s
    temp[2] += matrix[1][3] * s

    temp[0] += matrix[2][0] * t
    temp[1] += matrix[2][1] * t
    temp[2] += t
    temp = [n % 360 for n in temp]
    if temp == [0, 225, 315]:
        return True, (True, "All right!")
    else:
        return False, (True, "This is the wrong final position {0}.".format(temp))


api.add_listener(
    ON_CONNECT,
    CheckiOReferee(
        tests=TESTS,
        checker=checker).on_ready)
