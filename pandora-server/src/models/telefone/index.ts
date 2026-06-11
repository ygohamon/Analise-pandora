import { logger } from '../../services/log.service';

export * from './telefone.model.sispesquisa';
export * from './telefone.model.receita_full';
export * from './telefone.model.ipc';
export * from './telefone.model.vep';
export * from './telefone.model.bd_receita';
export * from './telefone.model.cortex';
export * from './telefone.model.credilink';
export * from './telefone.model.cagepa';


const numeroNaoEncontrado = function (num: string, show: boolean = false) {
  if (show)
    logger.debug(`Formato do número ${num} não foi reconhecido, ele não será tratado.`)

  return num;
}

const checaDDD = function (ddd: string) {
  return [
    '11', '12', '13', '14', '15', '16', '17', '18', '19', '21',
    '22', '24', '27', '28', '31', '32', '33', '34', '35', '37',
    '38', '41', '42', '43', '44', '45', '46', '47', '48', '49',
    '51', '53', '54', '55', '61', '62', '63', '64', '65', '66',
    '67', '68', '69', '71', '73', '74', '75', '77', '79', '81',
    '82', '83', '84', '85', '86', '87', '88', '89', '91', '92',
    '93', '94', '95', '96', '97', '98', '99',
    '23', '78'
  ].includes(ddd);
}

export const normalizaNumero = function (ddd: string = '', telefone: string = '')  {
  const num = ddd + telefone;
  const tamanho = num.length;

  let _pais = '55';
  let _ddd = '00';
  let _numero = '';


  // 1 - Telefone Residencial 222 2478
  if (tamanho === 7) {
    // _ddd = '00';
    _numero = '3' + num
  }

  // 1 - Celular antigo 8720 2920
  // 2 - Telefone Residencial novo 3222 2478
  else if (tamanho === 8) {
    // _ddd = '83';
    if (num[0] === '8' || num[0] === '9') {
      _numero = '9' + num
    } else {
      _numero = num
    }
  }

  // 1 - 9 + Celular Novo ( 999924674 ) -  Acrescenta DDD 83
  else if (tamanho === 9) {
    if (num[0] === '9') {
      // _ddd = '83';
      _numero = num
    } else {
      return numeroNaoEncontrado(num)
    }
  }
  // 1 - DDD + Celular Antigo ( 8387032102 ) -  Acrescenta 9
  // 2 - DDD + Telefone Residencial Novo ( 8332443521 ) - Mantem
  else if (tamanho === 10) {
    if (checaDDD(num.slice(0,2))) {
      _ddd = num.slice(0, 2)
      if (num[2] === '8' || num[2] === '9')
        _numero = '9'
      _numero += num.slice(2)
    } else {
      return numeroNaoEncontrado(num)
    }
  }

  // 1 - 0 + DDD + Celular Antigo ( 08387168949 ) - Acrescenta 9
  // 2 - 0 + DDD + Telefone Residencial Novo ( 08336825757 ) - Mantem
  // 3 - DDD + Celular Novo ( 11976125677 )
  else if (tamanho === 11) {
    if (num[0] === '0') {
      if (checaDDD(num.slice(1, 3))) {
        _ddd = num.slice(1, 3)

        if (num[3] === '8' || num[3] === '9')
          _numero = '9'

        _numero += num.slice(3)
      } else {
        return numeroNaoEncontrado(num);
      }
    } else if (checaDDD(num.slice(0,2))) {
      if (num[2] === '9') {
        _ddd = num.slice(0, 2)
        _numero = num.slice(2)
      } else {
        return numeroNaoEncontrado(num)
      }
    } else {
      return numeroNaoEncontrado(num)
    }
  }

  // 1 - COD_PAIS(2) + DDD + Celular Antigo ( 558387168949 )
  // 2 - COD_PAIS(2) + DDD + Telefone Residencial Novo
  // 3 - 00 + DDD + Telefone Novo ( 002141060263 )
  // 4 - 083986040414 083999991555
  else if (tamanho === 12) {
    if (num.slice(0, 2) === '00') {
      if (checaDDD(num.slice(2, 4))) {
        _ddd = num.slice(2, 4)

        if (num[4] === '8' || num[4] === '9')
          _numero = '9'

        _numero += num.slice(4)
      } else {
        return numeroNaoEncontrado(num)
      }
    } else if (num[0] === '0') {
      if (checaDDD(num.slice(1, 3))) {
        _ddd = num.slice(1, 3)
        _numero = num.slice(3)
      }
    } else {
      _ddd = num.slice(2, 4)
      _pais = num.slice(0, 2)

      if (checaDDD(_ddd)) {
        if (num[4] === '8' || num[4] === '9')
          _numero = '9'
        _numero += num.slice(4)
      } else {
        return numeroNaoEncontrado(num)
      }
    }
  }

  // 1 - 00 + DDD + Celular Novo( 0033984525576 )
  // 2 - 0 + DDD + 9 + Celular Novo ( 084 9987223550 )
  // 3 - COD_PAIS + DDD + Celular Novo ( 5511962455486 )
  else if (tamanho === 13) {
    if (num.slice(0, 2) === '00') {
      if (checaDDD(num.slice(2, 4))) {
        _ddd = num.slice(2, 4)
        _numero = num.slice(4)
      } else {
        return numeroNaoEncontrado(num)
      }
    } else {
      if (checaDDD(num.slice(2, 4))) {
        _ddd = num.slice(2, 4)
        _pais = num.slice(0, 2)
        _numero = num.slice(4)
      } else if (num[2] === '0') {
        if (checaDDD(num.slice(3, 5))) {
          _ddd = num.slice(3, 5)
          if (num[5] === '8' || num[5] === '9')
            _numero = '9'
          _numero += num.slice(5)
        } else {
          return numeroNaoEncontrado(num)
        }
      }  else {
        return numeroNaoEncontrado(num)
      }
    }
  }

  else {
    return numeroNaoEncontrado(num);
  }

  return {
    ddd: _ddd,
    numero: _numero,
    pais: _pais
  }
}
